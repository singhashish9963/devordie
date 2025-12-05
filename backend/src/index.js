import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import simulationRoutes from './routes/simulation.js'
import configRoutes from './routes/config.js'
import battleRoutes from './routes/battle.js'
import authRoutes from './routes/auth.js'
import configurationRoutes from './routes/configs.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { requestLogger } from './middlewares/logger.js'

dotenv.config()

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devordie'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('📦 MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err))

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3004',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all in development
    }
  },
  credentials: true
}))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Battle Simulator API',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/configurations', configurationRoutes)
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
