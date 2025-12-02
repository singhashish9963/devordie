import mongoose from 'mongoose'

const simulationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gridSize: {
    width: Number,
    height: Number
  },
  units: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  }],
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  result: {
    type: Object,
    default: null
  }
}, {
  timestamps: true
})

export default mongoose.model('Simulation', simulationSchema)
