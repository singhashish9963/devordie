import { SimulationEngine } from './engine.js'
import { getWASMEngine } from './wasmEngine.js'
import dotenv from 'dotenv'

// Ensure dotenv is loaded before checking environment
dotenv.config()

export class SimulationService {
  constructor() {
    this.activeSimulations = new Map()
    this._useWASM = null // Lazy initialization
  }
  
  // Getter for useWASM that checks environment on first access
  get useWASM() {
    if (this._useWASM === null) {
      this._useWASM = process.env.USE_WASM === 'true'
      console.log(`🚀 Using ${this._useWASM ? 'WASM C++' : 'JavaScript'} engine (${process.env.USE_WASM ? 'USE_WASM=' + process.env.USE_WASM : 'USE_WASM not set'})`)
    }
    return this._useWASM
  }
  
  set useWASM(value) {
    this._useWASM = value
  }

  // Toggle engine type
  setEngineType(useWASM) {
    this._useWASM = useWASM
    console.log(`🔧 Switched to ${useWASM ? 'WASM' : 'JavaScript'} engine`)
  }

  // Create new simulation
  createSimulation(config) {
    try {
      const simulationId = this.generateId()
      const engine = new SimulationEngine({
        ...config,
        gridSize: config.gridSize || { width: 20, height: 20 },
        maxTicks: config.maxTicks || 1000
      })

      this.activeSimulations.set(simulationId, {
        engine,
        config,
        createdAt: new Date(),
        status: 'created',
        useWASM: this.useWASM
      })

      return {
        success: true,
        simulationId,
        message: 'Simulation created successfully',
        engine: this.useWASM ? 'wasm' : 'javascript'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Start simulation (supports both JS and WASM)
  async startSimulation(simulationId) {
    const simulation = this.activeSimulations.get(simulationId)
    if (!simulation) {
      return { success: false, error: 'Simulation not found' }
    }

    try {
      let result
      const startTime = Date.now()

      if (simulation.useWASM || this.useWASM) {
        // Use WASM engine
        console.log('⚡ Running simulation with WASM engine...')
        const wasmEngine = getWASMEngine()
        
        // Convert config to WASM format
        const wasmConfig = this.convertConfigForWASM(simulation.config)
        result = await wasmEngine.runSimulation(wasmConfig)
      } else {
        // Use JavaScript engine
        console.log('🐌 Running simulation with JavaScript engine...')
        result = await simulation.engine.runFull()
        result = {
          ...result.result,
          duration: Date.now() - startTime,
          engine: 'javascript'
        }
      }

      simulation.status = 'completed'
      simulation.result = result

      return {
        success: true,
        result,
        engine: simulation.useWASM || this.useWASM ? 'wasm' : 'javascript'
      }
    } catch (error) {
      simulation.status = 'failed'
      console.error('Simulation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Convert configuration to WASM format
  convertConfigForWASM(config) {
    const { gridSize, units, terrain } = config

    // Convert terrain
    const terrainGrid = terrain || Array(gridSize.height).fill(null).map(() =>
      Array(gridSize.width).fill({ type: 'ground', speedMultiplier: 1.0 })
    )

    // Flatten units
    const allUnits = [
      ...units.teamA.map(u => ({ ...u, team: 'A' })),
      ...units.teamB.map(u => ({ ...u, team: 'B' }))
    ]

    return {
      terrain: terrainGrid,
      units: allUnits,
      maxTicks: config.maxTicks || 1000
    }
  }

  // Step through simulation
  stepSimulation(simulationId) {
    const simulation = this.activeSimulations.get(simulationId)
    if (!simulation) {
      return { success: false, error: 'Simulation not found' }
    }

    try {
      if (simulation.status === 'created') {
        simulation.engine.initialize()
        simulation.status = 'running'
      }

      const state = simulation.engine.tick()
      
      if (simulation.engine.isFinished()) {
        simulation.status = 'completed'
      }

      return {
        success: true,
        state
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get simulation state
  getSimulationState(simulationId) {
    const simulation = this.activeSimulations.get(simulationId)
    if (!simulation) {
      return { success: false, error: 'Simulation not found' }
    }

    return {
      success: true,
      state: simulation.engine.getState(),
      status: simulation.status
    }
  }

  // Validate simulation configuration
  validateSimulation(config) {
    const errors = []

    // Validate grid size
    if (!config.gridSize || !config.gridSize.width || !config.gridSize.height) {
      errors.push('Grid size is required')
    }

    // Validate units
    if (!config.units || !config.units.teamA || !config.units.teamB) {
      errors.push('Both teams must have units')
    }

    if (config.units.teamA.length === 0) {
      errors.push('Team A must have at least one unit')
    }

    if (config.units.teamB.length === 0) {
      errors.push('Team B must have at least one unit')
    }

    // Validate code
    if (!config.code || !config.code.teamA || !config.code.teamB) {
      errors.push('AI code is required for both teams')
    }

    // Validate unit positions
    const validateUnitPositions = (units, teamName) => {
      units.forEach((unit, index) => {
        if (!unit.position || unit.position.x === undefined || unit.position.y === undefined) {
          errors.push(`${teamName} unit ${index} missing position`)
        }
        if (unit.position.x < 0 || unit.position.x >= config.gridSize.width) {
          errors.push(`${teamName} unit ${index} x position out of bounds`)
        }
        if (unit.position.y < 0 || unit.position.y >= config.gridSize.height) {
          errors.push(`${teamName} unit ${index} y position out of bounds`)
        }
      })
    }

    if (config.units.teamA) validateUnitPositions(config.units.teamA, 'Team A')
    if (config.units.teamB) validateUnitPositions(config.units.teamB, 'Team B')

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Delete simulation
  deleteSimulation(simulationId) {
    const deleted = this.activeSimulations.delete(simulationId)
    return {
      success: deleted,
      message: deleted ? 'Simulation deleted' : 'Simulation not found'
    }
  }

  // Get all simulations
  getAllSimulations() {
    const simulations = []
    this.activeSimulations.forEach((sim, id) => {
      simulations.push({
        id,
        status: sim.status,
        createdAt: sim.createdAt,
        config: {
          gridSize: sim.config.gridSize,
          unitCounts: {
            teamA: sim.config.units.teamA.length,
            teamB: sim.config.units.teamB.length
          }
        }
      })
    })
    return simulations
  }

  // Clean up old simulations
  cleanup(maxAge = 3600000) { // 1 hour default
    const now = Date.now()
    const toDelete = []

    this.activeSimulations.forEach((sim, id) => {
      if (now - sim.createdAt.getTime() > maxAge) {
        toDelete.push(id)
      }
    })

    toDelete.forEach(id => this.activeSimulations.delete(id))
    
    return {
      cleaned: toDelete.length,
      remaining: this.activeSimulations.size
    }
  }

  // Generate unique ID
  generateId() {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const simulationService = new SimulationService()
