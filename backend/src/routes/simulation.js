import express from 'express'
import { getSimulations, createSimulation, runSimulation } from '../controllers/simulationController.js'

const router = express.Router()

router.get('/', getSimulations)
router.post('/', createSimulation)
router.post('/:id/run', runSimulation)

export default router
