import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WASM Battle Engine Loader
class WASMEngine {
  constructor() {
    this.module = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      const wasmPath = path.join(__dirname, '../../wasm/battle_sim.wasm');
      const jsPath = path.join(__dirname, '../../wasm/battle_sim.js');

      // Check if WASM files exist
      if (!fs.existsSync(wasmPath) || !fs.existsSync(jsPath)) {
        throw new Error('WASM files not found. Please build the C++ engine first.');
      }

      // Use Node's VM to execute the WASM JS and capture exports
      const vm = await import('vm');
      const wasmCode = fs.readFileSync(jsPath, 'utf-8');
      
      // Create a context with module and exports
      const sandbox = {
        console,
        process,
        Buffer,
        __filename: jsPath,
        __dirname: path.dirname(jsPath),
        require: (await import('module')).createRequire(jsPath),
        module: { exports: {} },
        exports: {},
        globalThis: {},
        global: {},
        fs  // Add fs for readFileSync
      };
      
      // Execute the WASM module in the sandbox
      vm.runInNewContext(wasmCode, sandbox, { filename: jsPath });
      
      // Extract the function from module.exports
      const createBattleSimulator = sandbox.module.exports;
      
      if (typeof createBattleSimulator !== 'function') {
        throw new Error(`Failed to load WASM module. Type: ${typeof createBattleSimulator}`);
      }

      // Initialize the module
      const wasmBinary = fs.readFileSync(wasmPath);
      
      this.module = await createBattleSimulator({
        wasmBinary,  // Provide the WASM binary directly
        locateFile: (filename) => {
          if (filename.endsWith('.wasm')) {
            return wasmPath;
          }
          return filename;
        }
      });

      this.initialized = true;
      console.log('✅ WASM Battle Engine loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load WASM module:', error);
      throw error;
    }
  }

  // Convert JavaScript unit to WASM Unit structure
  createUnit(jsUnit) {
    if (!this.initialized || !this.module) {
      throw new Error('WASM module not initialized');
    }

    const wasmUnit = new this.module.Unit();
    wasmUnit.id = jsUnit.id;
    wasmUnit.team = jsUnit.team || 'A';
    wasmUnit.type = jsUnit.type || 'soldier';
    
    // Position
    wasmUnit.position = new this.module.Position();
    wasmUnit.position.x = Math.floor(jsUnit.x);
    wasmUnit.position.y = Math.floor(jsUnit.y);
    
    // Stats
    wasmUnit.health = jsUnit.hp || 100;
    wasmUnit.maxHealth = jsUnit.hp || 100;
    wasmUnit.attack = jsUnit.attack || 10;
    wasmUnit.defense = jsUnit.defense || 5;
    wasmUnit.speed = jsUnit.speed || 1;
    wasmUnit.range = jsUnit.range || 1;
    wasmUnit.alive = true;
    wasmUnit.cooldown = 0;

    return wasmUnit;
  }

  // Run simulation
  async runSimulation(config) {
    if (!this.initialized) {
      await this.initialize();
    }

    const { terrain, units, maxTicks = 1000 } = config;

    // Create engine
    const gridWidth = terrain[0].length;
    const gridHeight = terrain.length;
    const engine = new this.module.BattleEngine(gridWidth, gridHeight, maxTicks);

    // Add units
    for (const unit of units) {
      try {
        const wasmUnit = this.createUnit(unit);
        engine.addUnit(wasmUnit);
      } catch (error) {
        console.error('Error adding unit:', error);
      }
    }

    // Initialize battle
    engine.initialize();

    // Run simulation
    const startTime = Date.now();
    engine.run();
    const duration = Date.now() - startTime;

    // Get results
    const stats = engine.getBattleStats();
    const finalState = engine.getState();

    // Convert WASM units back to JavaScript objects
    const finalUnits = [];
    const unitsVector = finalState.units;
    
    for (let i = 0; i < unitsVector.size(); i++) {
      const unit = unitsVector.get(i);
      finalUnits.push({
        id: unit.id,
        team: unit.team,
        type: unit.type,
        x: unit.position.x,
        y: unit.position.y,
        hp: unit.health,
        maxHp: unit.maxHealth,
        attack: unit.attack,
        defense: unit.defense,
        speed: unit.speed,
        range: unit.range,
        alive: unit.alive
      });
    }

    // Convert logs
    const logs = [];
    const logsVector = stats.logs;
    for (let i = 0; i < logsVector.size(); i++) {
      logs.push(logsVector.get(i));
    }

    return {
      winner: stats.winner,
      totalTicks: stats.totalTicks,
      teamAUnitsRemaining: stats.teamAUnitsRemaining,
      teamBUnitsRemaining: stats.teamBUnitsRemaining,
      totalDamageDealt: stats.totalDamageDealt,
      units: finalUnits,
      logs: logs,
      duration: duration,
      engine: 'wasm'
    };
  }

  // Clean up
  destroy() {
    if (this.module) {
      // WASM cleanup if needed
      this.module = null;
      this.initialized = false;
    }
  }
}

// Singleton instance
let wasmEngineInstance = null;

function getWASMEngine() {
  if (!wasmEngineInstance) {
    wasmEngineInstance = new WASMEngine();
  }
  return wasmEngineInstance;
}

export {
  WASMEngine,
  getWASMEngine
};
