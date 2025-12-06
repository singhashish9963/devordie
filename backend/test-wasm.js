import { getWASMEngine } from './src/services/wasmEngine.js';
import dotenv from 'dotenv';

dotenv.config();

async function testWASMEngine() {
  console.log('🧪 Testing WASM Engine...\n');
  
  try {
    const wasmEngine = getWASMEngine();
    console.log('📦 WASM Engine instance created');

    // Create test configuration
    const testConfig = {
      terrain: Array(20).fill(null).map(() => 
        Array(20).fill({ type: 'ground', speedMultiplier: 1.0 })
      ),
      units: [
        // Team A
        { id: 'a1', team: 'A', type: 'soldier', x: 2, y: 2, hp: 100, attack: 15, defense: 10, speed: 2, range: 1 },
        { id: 'a2', team: 'A', type: 'archer', x: 3, y: 2, hp: 80, attack: 20, defense: 5, speed: 1, range: 3 },
        { id: 'a3', team: 'A', type: 'tank', x: 4, y: 2, hp: 200, attack: 10, defense: 20, speed: 1, range: 1 },
        // Team B
        { id: 'b1', team: 'B', type: 'soldier', x: 17, y: 17, hp: 100, attack: 15, defense: 10, speed: 2, range: 1 },
        { id: 'b2', team: 'B', type: 'archer', x: 16, y: 17, hp: 80, attack: 20, defense: 5, speed: 1, range: 3 },
        { id: 'b3', team: 'B', type: 'tank', x: 15, y: 17, hp: 200, attack: 10, defense: 20, speed: 1, range: 1 },
      ],
      maxTicks: 500
    };

    console.log('⚙️  Running simulation with WASM engine...\n');
    const startTime = Date.now();
    const result = await wasmEngine.runSimulation(testConfig);
    const duration = Date.now() - startTime;

    console.log('✅ WASM Simulation completed!\n');
    console.log('📊 Results:');
    console.log(`   Winner: ${result.winner}`);
    console.log(`   Total Ticks: ${result.totalTicks}`);
    console.log(`   Team A Remaining: ${result.teamAUnitsRemaining}`);
    console.log(`   Team B Remaining: ${result.teamBUnitsRemaining}`);
    console.log(`   Total Damage: ${result.totalDamageDealt}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Engine: ${result.engine}`);
    console.log(`\n   Final Units: ${result.units.filter(u => u.alive).length} alive`);
    
    if (result.logs && result.logs.length > 0) {
      console.log(`\n   Sample logs (first 5):`);
      result.logs.slice(0, 5).forEach(log => console.log(`     - ${log}`));
    }

    console.log('\n🎉 WASM Engine test successful!');
  } catch (error) {
    console.error('❌ WASM Engine test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testWASMEngine();
