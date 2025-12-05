import mongoose from 'mongoose'

const configurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Configuration name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  terrain: {
    type: [[String]], // 2D array of terrain IDs
    required: true
  },
  units: {
    teamA: [{
      type: {
        type: String,
        required: true
      },
      position: {
        x: Number,
        y: Number
      },
      health: Number,
      attack: Number,
      defense: Number,
      speed: Number,
      range: Number,
      special: mongoose.Schema.Types.Mixed
    }],
    teamB: [{
      type: {
        type: String,
        required: true
      },
      position: {
        x: Number,
        y: Number
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
    teamA: {
      type: String,
      required: true
    },
    teamB: {
      type: String,
      required: true
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  stats: {
    timesUsed: {
      type: Number,
      default: 0
    },
    wins: {
      teamA: { type: Number, default: 0 },
      teamB: { type: Number, default: 0 }
    },
    draws: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update timestamp on save
configurationSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Index for faster queries
configurationSchema.index({ userId: 1, createdAt: -1 })
configurationSchema.index({ isPublic: 1, createdAt: -1 })

export default mongoose.model('Configuration', configurationSchema)
