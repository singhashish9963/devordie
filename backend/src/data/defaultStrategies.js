// Default strategies available to all players
export const defaultStrategies = [
  {
    name: 'Defensive',
    code: `// Defensive Strategy - Protects workers and defends territory
function act(unit, state) {
  // Gatherers focus on collecting resources safely
  if (unit.type === 'gatherer') {
    const nearbyResources = state.resources.filter(r => 
      Math.abs(r.x - unit.x) <= 5 && Math.abs(r.y - unit.y) <= 5
    );
    
    if (nearbyResources.length > 0) {
      const closest = nearbyResources.reduce((a, b) => 
        Math.hypot(a.x - unit.x, a.y - unit.y) < Math.hypot(b.x - unit.x, b.y - unit.y) ? a : b
      );
      return { action: 'move', dx: Math.sign(closest.x - unit.x), dy: Math.sign(closest.y - unit.y) };
    }
  }
  
  // Soldiers stay near base and defend
  if (unit.type === 'soldier') {
    const enemyUnits = state.enemyUnits.filter(e => 
      Math.abs(e.x - unit.x) <= 4 && Math.abs(e.y - unit.y) <= 4
    );
    
    if (enemyUnits.length > 0) {
      const target = enemyUnits[0];
      if (Math.abs(target.x - unit.x) <= 1 && Math.abs(target.y - unit.y) <= 1) {
        return { action: 'attack', targetId: target.id };
      }
      return { action: 'move', dx: Math.sign(target.x - unit.x), dy: Math.sign(target.y - unit.y) };
    }
    
    // Return to base if no enemies
    if (unit.x > 10 || unit.y > 10) {
      return { action: 'move', dx: -1, dy: -1 };
    }
  }
  
  return { action: 'idle' };
}`,
    description: 'A defensive strategy that focuses on protecting workers and defending home territory',
    tags: ['defensive', 'balanced', 'beginner'],
    isDefault: true,
    stats: {
      wins: 0,
      losses: 0,
      draws: 0,
      totalBattles: 0
    }
  },
  {
    name: 'Aggressive',
    code: `// Aggressive Strategy - Attacks enemies immediately
function act(unit, state) {
  // All units prioritize attacking enemies
  const nearbyEnemies = state.enemyUnits.filter(e => 
    Math.abs(e.x - unit.x) <= 6 && Math.abs(e.y - unit.y) <= 6
  );
  
  if (nearbyEnemies.length > 0) {
    const target = nearbyEnemies[0];
    
    // Attack if in range
    if (Math.abs(target.x - unit.x) <= 1 && Math.abs(target.y - unit.y) <= 1) {
      return { action: 'attack', targetId: target.id };
    }
    
    // Move towards enemy
    return { action: 'move', dx: Math.sign(target.x - unit.x), dy: Math.sign(target.y - unit.y) };
  }
  
  // Gatherers collect resources when no enemies nearby
  if (unit.type === 'gatherer') {
    const resources = state.resources.filter(r => 
      Math.abs(r.x - unit.x) <= 4 && Math.abs(r.y - unit.y) <= 4
    );
    
    if (resources.length > 0) {
      const closest = resources[0];
      return { action: 'move', dx: Math.sign(closest.x - unit.x), dy: Math.sign(closest.y - unit.y) };
    }
  }
  
  // Soldiers patrol forward
  if (unit.type === 'soldier' && unit.x < 15) {
    return { action: 'move', dx: 1, dy: 0 };
  }
  
  return { action: 'idle' };
}`,
    description: 'An aggressive strategy that prioritizes attacking enemies and controlling the battlefield',
    tags: ['aggressive', 'offensive', 'beginner'],
    isDefault: true,
    stats: {
      wins: 0,
      losses: 0,
      draws: 0,
      totalBattles: 0
    }
  },
  {
    name: 'Balanced',
    code: `// Balanced Strategy - Mix of resource gathering and combat
function act(unit, state) {
  const myUnits = state.myUnits.length;
  const enemyUnits = state.enemyUnits.length;
  
  // Gatherers focus on resources but flee from danger
  if (unit.type === 'gatherer') {
    const nearbyEnemies = state.enemyUnits.filter(e => 
      Math.abs(e.x - unit.x) <= 3 && Math.abs(e.y - unit.y) <= 3
    );
    
    if (nearbyEnemies.length > 0) {
      // Flee from enemies
      const enemy = nearbyEnemies[0];
      return { action: 'move', dx: -Math.sign(enemy.x - unit.x), dy: -Math.sign(enemy.y - unit.y) };
    }
    
    const resources = state.resources.filter(r => 
      Math.abs(r.x - unit.x) <= 5 && Math.abs(r.y - unit.y) <= 5
    );
    
    if (resources.length > 0) {
      const closest = resources[0];
      return { action: 'move', dx: Math.sign(closest.x - unit.x), dy: Math.sign(closest.y - unit.y) };
    }
  }
  
  // Soldiers adapt based on army size
  if (unit.type === 'soldier') {
    const nearbyEnemies = state.enemyUnits.filter(e => 
      Math.abs(e.x - unit.x) <= 5 && Math.abs(e.y - unit.y) <= 5
    );
    
    if (nearbyEnemies.length > 0) {
      const target = nearbyEnemies[0];
      
      // Attack if we have advantage or equal forces
      if (myUnits >= enemyUnits) {
        if (Math.abs(target.x - unit.x) <= 1 && Math.abs(target.y - unit.y) <= 1) {
          return { action: 'attack', targetId: target.id };
        }
        return { action: 'move', dx: Math.sign(target.x - unit.x), dy: Math.sign(target.y - unit.y) };
      } else {
        // Retreat if outnumbered
        return { action: 'move', dx: -Math.sign(target.x - unit.x), dy: -Math.sign(target.y - unit.y) };
      }
    }
    
    // Patrol middle ground
    if (unit.x < 8) {
      return { action: 'move', dx: 1, dy: 0 };
    } else if (unit.x > 12) {
      return { action: 'move', dx: -1, dy: 0 };
    }
  }
  
  return { action: 'idle' };
}`,
    description: 'A balanced strategy that adapts between resource gathering and combat based on the situation',
    tags: ['balanced', 'adaptive', 'beginner'],
    isDefault: true,
    stats: {
      wins: 0,
      losses: 0,
      draws: 0,
      totalBattles: 0
    }
  }
];
