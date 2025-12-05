// Grid Configuration
export const GRID_SIZE = {
  WIDTH: 20,
  HEIGHT: 20,
  CELL_SIZE: 30 // pixels
}

// Terrain Types
export const TERRAIN_TYPES = {
  GROUND: { 
    id: 'ground', 
    name: 'Ground', 
    color: '#90EE90', 
    moveCost: 1,
    defenseBonus: 0,
    speedMultiplier: 1,
    description: 'Normal ground'
  },
  WATER: { 
    id: 'water', 
    name: 'Water', 
    color: '#4682B4', 
    moveCost: 10,
    defenseBonus: -5,
    speedMultiplier: 0.1,
    description: 'Very slow, defense penalty'
  },
  MOUNTAIN: { 
    id: 'mountain', 
    name: 'Mountain', 
    color: '#8B4513', 
    moveCost: 3,
    defenseBonus: 10,
    speedMultiplier: 0.3,
    description: 'High ground advantage'
  },
  FOREST: { 
    id: 'forest', 
    name: 'Forest', 
    color: '#228B22', 
    moveCost: 2,
    defenseBonus: 5,
    speedMultiplier: 0.5,
    description: 'Cover and concealment'
  },
  ROAD: { 
    id: 'road', 
    name: 'Road', 
    color: '#D2B48C', 
    moveCost: 0.5,
    defenseBonus: 0,
    speedMultiplier: 1.5,
    description: 'Fast movement'
  },
  SWAMP: { 
    id: 'swamp', 
    name: 'Swamp', 
    color: '#556B2F', 
    moveCost: 4,
    defenseBonus: -3,
    speedMultiplier: 0.25,
    description: 'Muddy and slow'
  },
  DESERT: { 
    id: 'desert', 
    name: 'Desert', 
    color: '#F4A460', 
    moveCost: 1.5,
    defenseBonus: -2,
    speedMultiplier: 0.8,
    description: 'Open sandy terrain'
  },
  FORTRESS: { 
    id: 'fortress', 
    name: 'Fortress', 
    color: '#696969', 
    moveCost: 1,
    defenseBonus: 20,
    speedMultiplier: 1,
    description: 'Fortified position'
  }
}

// Unit Types
export const UNIT_TYPES = {
  SOLDIER: {
    id: 'soldier',
    name: 'Soldier',
    color: '#FF4444',
    health: 100,
    attack: 15,
    defense: 10,
    speed: 3, // Increased from 2
    range: 1,
    description: 'Balanced infantry unit',
    emoji: '⚔️'
  },
  ARCHER: {
    id: 'archer',
    name: 'Archer',
    color: '#4444FF',
    health: 80,
    attack: 20,
    defense: 5,
    speed: 2, // Increased from 1
    range: 3,
    description: 'Long-range attacker',
    emoji: '🏹'
  },
  TANK: {
    id: 'tank',
    name: 'Tank',
    color: '#44FF44',
    health: 150,
    attack: 25,
    defense: 20,
    speed: 2, // Increased from 1
    range: 2,
    description: 'Heavy armored unit',
    emoji: '🛡️'
  },
  DRONE: {
    id: 'drone',
    name: 'Drone',
    color: '#FFD700',
    health: 50,
    attack: 12,
    defense: 2,
    speed: 5,
    range: 4,
    description: 'Fast reconnaissance unit - ignores terrain penalties',
    emoji: '🚁',
    special: {
      ignoresTerrain: true,
      visionRange: 6
    }
  },
  SNIPER: {
    id: 'sniper',
    name: 'Sniper',
    color: '#8B008B',
    health: 60,
    attack: 35,
    defense: 3,
    speed: 2,
    range: 5,
    description: 'Extreme range, high damage, slow attack',
    emoji: '🎯',
    special: {
      criticalChance: 0.3,
      attackCooldown: 5
    }
  },
  MEDIC: {
    id: 'medic',
    name: 'Medic',
    color: '#FF69B4',
    health: 70,
    attack: 5,
    defense: 8,
    speed: 3,
    range: 1,
    description: 'Heals nearby allies instead of attacking',
    emoji: '⚕️',
    special: {
      healAmount: 15,
      healRange: 2,
      healCooldown: 3
    }
  }
}

// Team Colors
export const TEAM_COLORS = {
  TEAM_A: '#FF6B6B',
  TEAM_B: '#4ECDC4'
}

// Simulation States
export const SIMULATION_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished'
}

// Default Code Templates
export const CODE_TEMPLATES = {
  TEAM_A: `// Team A Strategy
// Your AI logic here
// Access: state.self, state.enemies, state.allies, state.terrain

// Find closest enemy
if (state.enemies.length === 0) {
  return { action: 'idle' };
}

const closestEnemy = state.enemies.reduce((closest, enemy) => {
  const distCurrent = Math.sqrt(
    Math.pow(enemy.position.x - state.self.position.x, 2) + 
    Math.pow(enemy.position.y - state.self.position.y, 2)
  );
  const distClosest = closest ? Math.sqrt(
    Math.pow(closest.position.x - state.self.position.x, 2) + 
    Math.pow(closest.position.y - state.self.position.y, 2)
  ) : Infinity;
  return distCurrent < distClosest ? enemy : closest;
}, null);

const distance = Math.sqrt(
  Math.pow(closestEnemy.position.x - state.self.position.x, 2) + 
  Math.pow(closestEnemy.position.y - state.self.position.y, 2)
);

// Attack if in range
if (distance <= state.self.range) {
  return {
    action: 'attack',
    targetId: closestEnemy.id
  };
}

// Move towards enemy
return {
  action: 'move',
  target: closestEnemy.position
};`,
  TEAM_B: `// Team B Strategy
// Your AI logic here
// Access: state.self, state.enemies, state.allies, state.terrain

// Find closest enemy
if (state.enemies.length === 0) {
  return { action: 'idle' };
}

const closestEnemy = state.enemies.reduce((closest, enemy) => {
  const distCurrent = Math.sqrt(
    Math.pow(enemy.position.x - state.self.position.x, 2) + 
    Math.pow(enemy.position.y - state.self.position.y, 2)
  );
  const distClosest = closest ? Math.sqrt(
    Math.pow(closest.position.x - state.self.position.x, 2) + 
    Math.pow(closest.position.y - state.self.position.y, 2)
  ) : Infinity;
  return distCurrent < distClosest ? enemy : closest;
}, null);

const distance = Math.sqrt(
  Math.pow(closestEnemy.position.x - state.self.position.x, 2) + 
  Math.pow(closestEnemy.position.y - state.self.position.y, 2)
);

// Attack if in range
if (distance <= state.self.range) {
  return {
    action: 'attack',
    targetId: closestEnemy.id
  };
}

// Move towards enemy
return {
  action: 'move',
  target: closestEnemy.position
};`
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
