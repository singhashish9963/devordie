import mongoose from 'mongoose';

const strategySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'javascript',
    enum: ['javascript', 'python']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    totalBattles: { type: Number, default: 0 }
  },
  lastUsed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
strategySchema.index({ userId: 1, createdAt: -1 });
strategySchema.index({ isPublic: 1, createdAt: -1 });

const Strategy = mongoose.model('Strategy', strategySchema);

export default Strategy;
