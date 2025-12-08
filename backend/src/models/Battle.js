import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['soldier', 'archer', 'tank', 'drone', 'sniper']
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  hp: { type: Number, required: true },
  maxHp: { type: Number, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  range: { type: Number, required: true },
  speed: { type: Number, required: true }
}, { _id: false });

const playerSetupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  username: { type: String, default: null },
  units: [unitSchema],
  aiCode: { type: String, default: null },
  submitted: { type: Boolean, default: false },
  side: {
    type: String,
    enum: ['left', 'right'],
    required: true
  }
}, { _id: false });

const battleResultSchema = new mongoose.Schema({
  winner: {
    type: String,
    enum: ['player1', 'player2', 'draw', null],
    default: null
  },
  ticks: { type: Number, default: 0 },
  endReason: {
    type: String,
    enum: ['elimination', 'time_limit', 'surrender', null],
    default: null
  },
  stats: {
    player1: {
      kills: { type: Number, default: 0 },
      damage: { type: Number, default: 0 },
      unitsLost: { type: Number, default: 0 },
      finalHP: { type: Number, default: 0 }
    },
    player2: {
      kills: { type: Number, default: 0 },
      damage: { type: Number, default: 0 },
      unitsLost: { type: Number, default: 0 },
      finalHP: { type: Number, default: 0 }
    }
  }
}, { _id: false });

const battleSchema = new mongoose.Schema({
  battleCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'in_progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  configuration: {
    terrain: {
      type: [[Number]],
      required: true,
      default: () => Array(20).fill(null).map(() => Array(20).fill(0))
    },
    gridSize: {
      width: { type: Number, default: 20 },
      height: { type: Number, default: 20 }
    },
    maxTurns: { type: Number, default: 1000 },
    victoryCondition: {
      type: String,
      enum: ['elimination', 'time_limit', 'base_capture'],
      default: 'elimination'
    },
    unitBudget: { type: Number, default: 1000 },
    maxUnits: { type: Number, default: 10 }
  },
  player1: playerSetupSchema,
  player2: playerSetupSchema,
  result: battleResultSchema,
  simulationId: {
    type: String,
    default: null
  },
  replay: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  }
}, {
  timestamps: true
});

// Auto-delete expired battles
battleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate unique battle code
battleSchema.statics.generateBattleCode = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'WAR-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get unit cost
battleSchema.statics.getUnitCost = function(unitType) {
  const costs = {
    soldier: 100,
    archer: 80,
    tank: 150,
    drone: 120,
    sniper: 140
  };
  return costs[unitType] || 0;
};

// Get unit stats
battleSchema.statics.getUnitStats = function(unitType) {
  const stats = {
    soldier: { hp: 100, attack: 20, defense: 10, range: 1, speed: 5 },
    archer: { hp: 80, attack: 15, defense: 5, range: 5, speed: 4 },
    tank: { hp: 150, attack: 30, defense: 20, range: 1, speed: 3 },
    drone: { hp: 60, attack: 10, defense: 2, range: 8, speed: 8 },
    sniper: { hp: 70, attack: 50, defense: 5, range: 10, speed: 3 }
  };
  return stats[unitType] || null;
};

// Validate unit setup
battleSchema.methods.validateUnits = function(units, budget) {
  let totalCost = 0;
  
  for (const unit of units) {
    const cost = this.constructor.getUnitCost(unit.type);
    totalCost += cost;
  }
  
  if (totalCost > budget) {
    return { valid: false, error: `Total cost ${totalCost} exceeds budget ${budget}` };
  }
  
  if (units.length > this.configuration.maxUnits) {
    return { valid: false, error: `Too many units. Max: ${this.configuration.maxUnits}` };
  }
  
  return { valid: true, totalCost };
};

// Check if battle is ready to start
battleSchema.methods.isReadyToStart = function() {
  return this.player1.submitted && 
         this.player2.submitted && 
         this.player1.userId && 
         this.player2.userId &&
         this.status === 'ready';
};

// Get player role
battleSchema.methods.getPlayerRole = function(userId) {
  const player1Id = this.player1.userId?._id || this.player1.userId;
  const player2Id = this.player2.userId?._id || this.player2.userId;
  
  if (player1Id && player1Id.toString() === userId.toString()) {
    return 'player1';
  }
  if (player2Id && player2Id.toString() === userId.toString()) {
    return 'player2';
  }
  return null;
};

const Battle = mongoose.model('Battle', battleSchema);

export default Battle;
