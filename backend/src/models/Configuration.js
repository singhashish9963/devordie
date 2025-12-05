import mongoose from 'mongoose'

const configurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Configuration name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Battle configuration data
  config: {
    gridSize: {
      width: { type: Number, default: 20 },
      height: { type: Number, default: 20 }
    },
    terrain: {
      type: [[String]], // 2D array of terrain IDs
      required: true
    },
    units: {
      teamA: [{
        type: { type: String, required: true },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true }
        },
        health: Number,
        attack: Number,
        defense: Number,
        speed: Number,
        range: Number,
        special: mongoose.Schema.Types.Mixed
      }],
      teamB: [{
        type: { type: String, required: true },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true }
        },
        health: Number,
        attack: Number,
        defense: Number,
        speed: Number,
        range: Number,
        special: mongoose.Schema.Types.Mixed
      }]
    },
    code: {
      teamA: { type: String, default: '' },
      teamB: { type: String, default: '' }
    }
  },
  // Metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  stats: {
    timesUsed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

// Index for faster queries
configurationSchema.index({ userId: 1, createdAt: -1 })
configurationSchema.index({ isPublic: 1, createdAt: -1 })
configurationSchema.index({ tags: 1 })

export default mongoose.model('Configuration', configurationSchema)
