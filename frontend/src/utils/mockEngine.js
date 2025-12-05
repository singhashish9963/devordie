// Mock simulation engine - placeholder for real WASM engine
export class MockSimulationEngine {
  constructor(config) {
    this.map = config.map;
    this.units = JSON.parse(JSON.stringify(config.units)); // Deep clone
    this.currentTurn = 0;
    this.maxTurns = config.maxTurns || 100;
    this.isFinished = false;
    this.winner = null;
    this.events = [];
  }

  // Execute one simulation step
  step() {
    if (this.isFinished) return null;

    this.currentTurn++;
    const turnEvents = [];

    // Process each unit (mock behavior)
    this.units.forEach(unit => {
      if (!unit.alive) return;

      // Mock movement: units move toward center
      const centerX = Math.floor(this.map.length / 2);
      const centerY = Math.floor(this.map[0].length / 2);

      const dx = centerX - unit.position.x;
      const dy = centerY - unit.position.y;

      // Simple movement toward center
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const newX = unit.position.x + Math.sign(dx);
        const newY = unit.position.y + Math.sign(dy);

        // Check bounds
        if (newX >= 0 && newX < this.map.length && newY >= 0 && newY < this.map[0].length) {
          turnEvents.push({
            type: 'MOVE',
            unitId: unit.id,
            from: { ...unit.position },
            to: { x: newX, y: newY }
          });
          unit.position = { x: newX, y: newY };
        }
      }

      // Mock combat: attack nearby enemies
      const nearbyEnemy = this.findNearbyEnemy(unit);
      if (nearbyEnemy) {
        const damage = Math.max(1, unit.stats.attack - nearbyEnemy.stats.defense);
        nearbyEnemy.stats.hp -= damage;

        turnEvents.push({
          type: 'ATTACK',
          attacker: unit.id,
          target: nearbyEnemy.id,
          damage
        });

        if (nearbyEnemy.stats.hp <= 0) {
          nearbyEnemy.alive = false;
          turnEvents.push({
            type: 'DEATH',
            unitId: nearbyEnemy.id
          });
        }
      }
    });

    this.events.push(...turnEvents);

    // Check win condition
    this.checkVictory();

    return {
      turn: this.currentTurn,
      units: this.units,
      events: turnEvents,
      isFinished: this.isFinished,
      winner: this.winner
    };
  }

  findNearbyEnemy(unit) {
    return this.units.find(u => 
      u.alive &&
      u.side !== unit.side &&
      Math.abs(u.position.x - unit.position.x) <= unit.stats.range &&
      Math.abs(u.position.y - unit.position.y) <= unit.stats.range
    );
  }

  checkVictory() {
    const playerAAlive = this.units.filter(u => u.side === 'playerA' && u.alive).length;
    const playerBAlive = this.units.filter(u => u.side === 'playerB' && u.alive).length;

    if (playerAAlive === 0) {
      this.isFinished = true;
      this.winner = 'playerB';
    } else if (playerBAlive === 0) {
      this.isFinished = true;
      this.winner = 'playerA';
    } else if (this.currentTurn >= this.maxTurns) {
      this.isFinished = true;
      this.winner = playerAAlive > playerBAlive ? 'playerA' : 'playerB';
    }
  }

  getState() {
    return {
      turn: this.currentTurn,
      units: this.units,
      isFinished: this.isFinished,
      winner: this.winner,
      events: this.events
    };
  }

  reset() {
    this.currentTurn = 0;
    this.isFinished = false;
    this.winner = null;
    this.events = [];
  }
}

// Helper: Initialize simulation from editor state
export function createSimulationConfig(editorState) {
  return {
    map: editorState.terrain,
    units: editorState.units.map((unit, index) => ({
      ...unit,
      id: `unit-${index}`,
      alive: true,
      stats: { ...unit.stats }
    })),
    logic: editorState.logic,
    maxTurns: 100
  };
}
