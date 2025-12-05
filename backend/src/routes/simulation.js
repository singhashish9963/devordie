import express from 'express'
import { 
  getAllSimulations, 
  createSimulation, 
  getSimulation,
  startSimulation,
  stepSimulation,
  deleteSimulation,
  validateConfiguration,
  cleanupSimulations
} from '../controllers/simulationController.js'

const router = express.Router()

// Get all simulations
router.get('/', getAllSimulations)

// Create new simulation
router.post('/', createSimulation)

// Validate configuration
router.post('/validate', validateConfiguration)

// Cleanup old simulations
router.post('/cleanup', cleanupSimulations)

// Get specific simulation
router.get('/:id', getSimulation)

// Start simulation (run to completion)
router.post('/:id/start', startSimulation)

// Step simulation (single tick)
router.post('/:id/step', stepSimulation)

// Delete simulation
router.delete('/:id', deleteSimulation)

export default router
