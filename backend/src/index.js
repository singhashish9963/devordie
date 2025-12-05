import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import simulationRoutes from './routes/simulation.js'
import configRoutes from './routes/config.js'
import battleRoutes from './routes/battle.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { requestLogger } from './middlewares/logger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3004',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Battle Simulator API'
  })
})

// API Routes
app.use('/api/simulations', simulationRoutes)
app.use('/api/configs', configRoutes)
app.use('/api/battles', battleRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

export default app
