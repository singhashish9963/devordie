import { simulationService } from '../services/simulationService.js'

// Get all simulations
export const getAllSimulations = async (req, res) => {
  try {
    const simulations = simulationService.getAllSimulations()
    res.json({
      success: true,
      count: simulations.length,
      simulations
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}

// Create new simulation
export const createSimulation = async (req, res) => {
  try {
    const config = req.body

    // Validate configuration
    const validation = simulationService.validateSimulation(config)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      })
    }

    // Create simulation
    const result = simulationService.createSimulation(config)
    
    if (result.success) {
      res.status(201).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}

// Get simulation by ID
export const getSimulation = async (req, res) => {
  try {
    const { id } = req.params
    const result = simulationService.getSimulationState(id)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(404).json(result)
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}

// Start simulation (run to completion)
export const startSimulation = async (req, res) => {
  try {
    const { id } = req.params
    const result = await simulationService.startSimulation(id)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}

// Step simulation (single tick)
export const stepSimulation = async (req, res) => {
  try {
    const { id } = req.params
    const result = simulationService.stepSimulation(id)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}

// Delete simulation
export const deleteSimulation = async (req, res) => {
  try {
    const { id } = req.params
    const result = simulationService.deleteSimulation(id)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(404).json(result)
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}

// Validate configuration
export const validateConfiguration = async (req, res) => {
  try {
    const config = req.body
    const validation = simulationService.validateSimulation(config)
    res.json(validation)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}

// Cleanup old simulations
export const cleanupSimulations = async (req, res) => {
  try {
    const maxAge = req.query.maxAge ? parseInt(req.query.maxAge) : 3600000
    const result = simulationService.cleanup(maxAge)
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
}
