import { SimulationEngine } from './engine.js'

export class SimulationService {
  constructor() {
    this.activeSimulations = new Map()
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
        status: 'created'
      })

      return {
        success: true,
        simulationId,
        message: 'Simulation created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Start simulation
  async startSimulation(simulationId) {
    const simulation = this.activeSimulations.get(simulationId)
    if (!simulation) {
      return { success: false, error: 'Simulation not found' }
    }

    try {
      const result = await simulation.engine.runFull()
      simulation.status = 'completed'
      simulation.result = result

      return {
        success: true,
        result: result.result
      }
    } catch (error) {
      simulation.status = 'failed'
      return {
        success: false,
        error: error.message
      }
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
