import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import simulationRoutes from './routes/simulation.js'
import unitRoutes from './routes/unit.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Battle Simulator API' })
})

app.use('/api/simulations', simulationRoutes)
app.use('/api/units', unitRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
