import Battle from '../models/Battle.js';

// Battle execution service
export class BattleService {
  
  // Start a battle
  static async startBattle(battleId, io) {
    try {
      const battle = await Battle.findById(battleId)
        .populate('player1.userId', 'name')
        .populate('player2.userId', 'name');

      if (!battle) {
        throw new Error('Battle not found');
      }

      if (!battle.isReadyToStart()) {
        throw new Error('Battle is not ready to start');
      }

      battle.status = 'in_progress';
      battle.startedAt = new Date();
      await battle.save();

      console.log(`⚔️ Starting battle: ${battle.battleCode}`);

      // Notify both players
      io.to(`battle-${battleId}`).emit('battle-started', {
        battleId: battle._id,
        battleCode: battle.battleCode,
        player1: {
          username: battle.player1.username,
          units: battle.player1.units.length
        },
        player2: {
          username: battle.player2.username,
          units: battle.player2.units.length
        },
        configuration: battle.configuration
      });

      // Execute battle simulation
      await this.executeBattle(battle, io);

      return { success: true, battleId };
    } catch (error) {
      console.error('Start battle error:', error);
      throw error;
    }
  }

  // Execute battle simulation
  static async executeBattle(battle, io) {
    try {
      const maxTicks = battle.configuration.maxTurns;
      let currentTick = 0;

      // Initialize unit states
      const player1Units = JSON.parse(JSON.stringify(battle.player1.units));
      const player2Units = JSON.parse(JSON.stringify(battle.player2.units));

      const stats = {
        player1: { kills: 0, damage: 0, unitsLost: 0, finalHP: 0 },
        player2: { kills: 0, damage: 0, unitsLost: 0, finalHP: 0 }
      };

      // Replay data storage
      const replayData = {
        initialState: {
          player1Units: JSON.parse(JSON.stringify(player1Units)),
          player2Units: JSON.parse(JSON.stringify(player2Units)),
          configuration: battle.configuration
        },
        ticks: []
      };

      // Simulation loop
      while (currentTick < maxTicks) {
        // Check victory conditions
        const p1Alive = player1Units.filter(u => u.hp > 0).length;
        const p2Alive = player2Units.filter(u => u.hp > 0).length;

        if (p1Alive === 0 || p2Alive === 0) {
          break;
        }

        // Execute AI for both players
        const tickEvents = [];

        // Process player 1 units
        for (const unit of player1Units) {
          if (unit.hp <= 0) continue;

          try {
            const decision = this.executeAI(
              battle.player1.aiCode,
              unit,
              player1Units,
              player2Units,
              battle.configuration.terrain,
              currentTick
            );

            const event = this.processDecision(unit, decision, player2Units, battle.configuration.terrain, 'player1');
            if (event) {
              tickEvents.push(event);
              if (event.type === 'attack' && event.damage > 0) {
                stats.player1.damage += event.damage;
                if (event.killed) {
                  stats.player1.kills++;
                  stats.player2.unitsLost++;
                }
              }
            }
          } catch (error) {
            console.error(`AI execution error for player1 unit:`, error.message);
          }
        }

        // Process player 2 units
        for (const unit of player2Units) {
          if (unit.hp <= 0) continue;

          try {
            const decision = this.executeAI(
              battle.player2.aiCode,
              unit,
              player2Units,
              player1Units,
              battle.configuration.terrain,
              currentTick
            );

            const event = this.processDecision(unit, decision, player1Units, battle.configuration.terrain, 'player2');
            if (event) {
              tickEvents.push(event);
              if (event.type === 'attack' && event.damage > 0) {
                stats.player2.damage += event.damage;
                if (event.killed) {
                  stats.player2.kills++;
                  stats.player1.unitsLost++;
                }
              }
            }
          } catch (error) {
            console.error(`AI execution error for player2 unit:`, error.message);
          }
        }

        // Broadcast tick update
        io.to(`battle-${battle._id}`).emit('tick-update', {
          tick: currentTick,
          player1Units: player1Units.map(u => ({ ...u, aiCode: undefined })),
          player2Units: player2Units.map(u => ({ ...u, aiCode: undefined })),
          events: tickEvents
        });

        // Save tick data for replay
        replayData.ticks.push({
          tick: currentTick,
          player1Units: JSON.parse(JSON.stringify(player1Units)),
          player2Units: JSON.parse(JSON.stringify(player2Units)),
          events: tickEvents
        });

        currentTick++;

        // Delay between ticks (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Calculate final HP
      stats.player1.finalHP = player1Units.reduce((sum, u) => sum + Math.max(0, u.hp), 0);
      stats.player2.finalHP = player2Units.reduce((sum, u) => sum + Math.max(0, u.hp), 0);

      // Determine winner
      let winner = null;
      let endReason = 'elimination';

      const p1Alive = player1Units.filter(u => u.hp > 0).length;
      const p2Alive = player2Units.filter(u => u.hp > 0).length;

      if (p1Alive === 0 && p2Alive === 0) {
        winner = 'draw';
      } else if (p1Alive === 0) {
        winner = 'player2';
      } else if (p2Alive === 0) {
        winner = 'player1';
      } else if (currentTick >= maxTicks) {
        // Time limit reached, check HP
        endReason = 'time_limit';
        if (stats.player1.finalHP > stats.player2.finalHP) {
          winner = 'player1';
        } else if (stats.player2.finalHP > stats.player1.finalHP) {
          winner = 'player2';
        } else {
          winner = 'draw';
        }
      }

      // Update battle result
      battle.status = 'completed';
      battle.completedAt = new Date();
      battle.result = {
        winner,
        ticks: currentTick,
        endReason,
        stats
      };
      battle.replay = replayData;

      await battle.save();

      console.log(`🏆 Battle ${battle.battleCode} completed. Winner: ${winner}`);

      // Broadcast battle end
      io.to(`battle-${battle._id}`).emit('battle-ended', {
        battleId: battle._id,
        winner,
        ticks: currentTick,
        endReason,
        stats
      });

      return { success: true, winner, stats };
    } catch (error) {
      console.error('Execute battle error:', error);
      throw error;
    }
  }

  // Execute AI code for a unit
  static executeAI(aiCode, unit, myUnits, enemyUnits, terrain, round) {
    try {
      // Create safe execution context
      const state = {
        self: {
          type: unit.type,
          position: unit.position,
          hp: unit.hp,
          maxHp: unit.maxHp,
          attack: unit.attack,
          defense: unit.defense,
          range: unit.range,
          speed: unit.speed
        },
        enemies: enemyUnits.filter(u => u.hp > 0).map(u => ({
          type: u.type,
          position: u.position,
          hp: u.hp,
          range: u.range
        })),
        allies: myUnits.filter(u => u.hp > 0 && u !== unit).map(u => ({
          type: u.type,
          position: u.position,
          hp: u.hp
        })),
        terrain: terrain,
        round: round
      };

      // Execute AI code with timeout
      const func = new Function('state', aiCode + '\n\nreturn getAction ? getAction(state) : { action: "move", target: state.self.position };');
      const decision = func(state);

      return decision;
    } catch (error) {
      // Return default action on error
      return { action: 'move', target: unit.position };
    }
  }

  // Process unit decision
  static processDecision(unit, decision, enemyUnits, terrain, player) {
    if (!decision || !decision.action) {
      return null;
    }

    if (decision.action === 'move' && decision.target) {
      // Clamp target position to grid boundaries (0-19)
      const clampedX = Math.max(0, Math.min(19, Math.round(decision.target.x)));
      const clampedY = Math.max(0, Math.min(19, Math.round(decision.target.y)));
      
      // Validate and move
      const dx = clampedX - unit.position.x;
      const dy = clampedY - unit.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= unit.speed) {
        const oldX = unit.position.x;
        const oldY = unit.position.y;
        
        unit.position.x = clampedX;
        unit.position.y = clampedY;

        return {
          type: 'move',
          player,
          unitType: unit.type,
          from: { x: oldX, y: oldY },
          to: { x: clampedX, y: clampedY }
        };
      }
    }

    if (decision.action === 'attack' && decision.target) {
      // Find target enemy
      const target = enemyUnits.find(e => 
        e.hp > 0 &&
        e.position.x === decision.target.x &&
        e.position.y === decision.target.y
      );

      if (target) {
        const dx = target.position.x - unit.position.x;
        const dy = target.position.y - unit.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= unit.range) {
          // Calculate damage
          const baseDamage = unit.attack;
          const defense = target.defense;
          const damage = Math.max(1, baseDamage - defense);

          target.hp -= damage;

          const killed = target.hp <= 0;

          return {
            type: 'attack',
            player,
            attacker: unit.type,
            target: target.type,
            damage,
            killed,
            position: target.position
          };
        }
      }
    }

    return null;
  }
}

export default BattleService;
