import mongoose from 'mongoose'

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['warrior', 'archer', 'mage'],
    required: true
  },
  health: {
    type: Number,
    required: true
  },
  attack: {
    type: Number,
    required: true
  },
  defense: {
    type: Number,
    required: true
  },
  position: {
    x: Number,
    y: Number
  },
  logic: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
})

export default mongoose.model('Unit', unitSchema)
