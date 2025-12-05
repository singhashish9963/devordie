// Simulation Engine - Core battle logic
export class SimulationEngine {
  constructor(config) {
    this.config = config
    this.state = {
      tick: 0,
      units: [],
      terrain: config.terrain || [],
      status: 'idle',
      logs: [],
      winner: null
    }
    this.maxTicks = config.maxTicks || 1000
    this.userFunctions = {
      teamA: null,
      teamB: null
    }
    this.lastHealthState = null
    this.noProgressTicks = 0
  }

  // Initialize simulation with units and code
  initialize() {
    try {
      // Parse and compile user code
      this.userFunctions.teamA = this.compileUserCode(this.config.code.teamA, 'teamA')
      this.userFunctions.teamB = this.compileUserCode(this.config.code.teamB, 'teamB')

      // Initialize units for both teams
      this.state.units = [
        ...this.initializeTeamUnits('teamA', this.config.units.teamA),
        ...this.initializeTeamUnits('teamB', this.config.units.teamB)
      ]

      this.state.status = 'initialized'
      this.addLog(`Simulation initialized successfully`)
      this.addLog(`Team A: ${this.config.units.teamA.length} units`)
      this.addLog(`Team B: ${this.config.units.teamB.length} units`)
      return { success: true }
    } catch (error) {
      this.addLog(`Initialization error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  // Compile user's JavaScript code with safety measures
  compileUserCode(code, teamName) {
    try {
      // The user code should NOT include function declaration
      // Just the function body/logic
      const wrappedCode = `
        return function(state) {
          try {
            ${code}
          } catch (error) {
            console.error('Team ${teamName} AI error:', error);
            return { action: 'idle' };
          }
        }
      `
      const fn = new Function(wrappedCode)()
      return fn
    } catch (error) {
      this.addLog(`Code compilation error for ${teamName}: ${error.message}`)
      // Return a safe default function
      return () => ({ action: 'idle' })
    }
  }

  // Initialize units for a team
  initializeTeamUnits(team, unitConfigs) {
    return unitConfigs.map((config, index) => ({
      id: `${team}-${index}-${Date.now()}`,
      team,
      type: config.type,
      position: { ...config.position },
      health: config.health,
      maxHealth: config.health,
      attack: config.attack,
      defense: config.defense,
      speed: config.speed,
      range: config.range,
      alive: true,
      target: null,
      cooldown: 0,
      special: config.special || {} // Store special abilities
    }))
  }

  // Execute one simulation tick
  tick() {
    if (this.state.status !== 'running' && this.state.status !== 'initialized') {
      return this.state
    }

    this.state.status = 'running'
    this.state.tick++

    // Check win conditions first
    if (this.checkWinCondition()) {
      this.state.status = 'finished'
      return this.state
    }

    // Check max ticks
    if (this.state.tick >= this.maxTicks) {
      this.state.status = 'finished'
      this.state.winner = 'draw'
      this.addLog('Battle ended in a draw - maximum ticks reached')
      return this.state
    }

    // Check for stalemate (no damage dealt for 50 ticks)
    const currentHealth = this.state.units.reduce((sum, u) => sum + u.health, 0)
    if (this.lastHealthState !== null && currentHealth === this.lastHealthState) {
      this.noProgressTicks++
      if (this.noProgressTicks >= 50) {
        this.state.status = 'finished'
        const teamAAlive = this.state.units.filter(u => u.team === 'teamA' && u.alive).length
        const teamBAlive = this.state.units.filter(u => u.team === 'teamB' && u.alive).length
        this.state.winner = teamAAlive > teamBAlive ? 'teamA' : teamBAlive > teamAAlive ? 'teamB' : 'draw'
        this.addLog(`Battle ended - stalemate detected (${this.state.winner})`)
        return this.state
      }
    } else {
      this.noProgressTicks = 0
    }
    this.lastHealthState = currentHealth

    // Process each alive unit
    const aliveUnits = this.state.units.filter(u => u.alive)
    
    for (const unit of aliveUnits) {
      this.processUnit(unit)
    }

    // Update cooldowns
    this.state.units.forEach(unit => {
      if (unit.cooldown > 0) unit.cooldown--
    })

    return this.state
  }

  // Process individual unit AI and actions
  processUnit(unit) {
    try {
      // Reduce cooldown
      if (unit.cooldown > 0) return

      // Check if this is a medic unit - heal instead of attack
      if (unit.type === 'medic' && unit.special.healAmount) {
        this.handleMedicHealing(unit)
        return
      }

      // Get AI decision from user code
      const aiState = this.getAIState(unit)
      const userFunc = this.userFunctions[unit.team]
      const decision = userFunc ? userFunc(aiState) : { action: 'idle' }

      // Execute decision
      this.executeAction(unit, decision)
    } catch (error) {
      this.addLog(`Unit ${unit.id} AI error: ${error.message}`)
    }
  }

  // Get state visible to AI
  getAIState(unit) {
    const enemies = this.state.units.filter(u => u.alive && u.team !== unit.team)
    const allies = this.state.units.filter(u => u.alive && u.team === unit.team && u.id !== unit.id)

    return {
      self: {
        position: unit.position,
        health: unit.health,
        maxHealth: unit.maxHealth,
        attack: unit.attack,
        defense: unit.defense,
        speed: unit.speed,
        range: unit.range
      },
      enemies: enemies.map(e => ({
        id: e.id,
        position: e.position,
        health: e.health,
        type: e.type
      })),
      allies: allies.map(a => ({
        id: a.id,
        position: a.position,
        health: a.health,
        type: a.type
      })),
      terrain: this.state.terrain,
      tick: this.state.tick
    }
  }

  // Execute unit action
  executeAction(unit, decision) {
    if (!decision || !decision.action) return

    switch (decision.action) {
      case 'move':
        this.handleMove(unit, decision)
        break
      case 'attack':
        this.handleAttack(unit, decision)
        break
      case 'idle':
        break
      default:
        this.addLog(`Unknown action: ${decision.action}`)
    }
  }

  // Handle unit movement
  handleMove(unit, decision) {
    const { direction, target } = decision
    let newPos = { ...unit.position }

    if (target) {
      // Move towards target position
      const dx = target.x - unit.position.x
      const dy = target.y - unit.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 0) {
        // Get terrain at current position
        const terrain = this.getTerrainAt(unit.position.x, unit.position.y)
        
        // Drones ignore terrain penalties
        const speedMultiplier = (unit.special.ignoresTerrain) ? 1 : (terrain.speedMultiplier || 1)
        
        // Apply terrain speed effect
        const effectiveSpeed = unit.speed * speedMultiplier
        
        const moveX = Math.round((dx / distance) * effectiveSpeed)
        const moveY = Math.round((dy / distance) * effectiveSpeed)
        newPos.x = Math.max(0, Math.min(this.config.gridSize.width - 1, unit.position.x + moveX))
        newPos.y = Math.max(0, Math.min(this.config.gridSize.height - 1, unit.position.y + moveY))
      }
    } else if (direction) {
      // Move in direction
      const directions = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        forward: { x: unit.team === 'teamA' ? 1 : -1, y: 0 }
      }
      
      const dir = directions[direction] || { x: 0, y: 0 }
      const terrain = this.getTerrainAt(unit.position.x, unit.position.y)
      const speedMultiplier = (unit.special.ignoresTerrain) ? 1 : (terrain.speedMultiplier || 1)
      const effectiveSpeed = unit.speed * speedMultiplier
      
      newPos.x = Math.max(0, Math.min(this.config.gridSize.width - 1, unit.position.x + dir.x * effectiveSpeed))
      newPos.y = Math.max(0, Math.min(this.config.gridSize.height - 1, unit.position.y + dir.y * effectiveSpeed))
    }

    // Check collision with other units
    const collision = this.state.units.find(u => 
      u.alive && u.id !== unit.id && u.position.x === newPos.x && u.position.y === newPos.y
    )

    if (!collision) {
      unit.position = newPos
    }
  }

  // Handle unit attack
  handleAttack(unit, decision) {
    if (unit.cooldown > 0) return

    const { targetId, target } = decision
    let targetUnit = null

    if (targetId) {
      targetUnit = this.state.units.find(u => u.id === targetId && u.alive)
    } else if (target) {
      // Find closest enemy near target position
      targetUnit = this.findClosestEnemy(unit, target)
    } else {
      // Attack closest enemy in range
      targetUnit = this.findClosestEnemy(unit)
    }

    if (targetUnit) {
      const distance = this.getDistance(unit.position, targetUnit.position)
      
      if (distance <= unit.range) {
        // Get terrain defense bonus for target
        const targetTerrain = this.getTerrainAt(targetUnit.position.x, targetUnit.position.y)
        const terrainDefenseBonus = targetTerrain.defenseBonus || 0
        
        // Calculate damage (defense now less effective)
        let baseDamage = unit.attack
        
        // Sniper critical hit chance
        if (unit.special.criticalChance && Math.random() < unit.special.criticalChance) {
          baseDamage *= 2
          this.addLog(`${unit.team} CRITICAL HIT!`)
        }
        
        const totalDefense = targetUnit.defense + terrainDefenseBonus
        const damageReduction = totalDefense * 0.2
        const finalDamage = Math.max(5, baseDamage - damageReduction)
        
        targetUnit.health -= finalDamage
        
        // Apply special cooldowns
        if (unit.special.attackCooldown) {
          unit.cooldown = unit.special.attackCooldown
        } else {
          unit.cooldown = 2
        }

        // Only log every 10th attack to reduce spam
        if (this.state.tick % 10 === 0) {
          this.addLog(`${unit.team} attacked ${targetUnit.team} (${Math.round(targetUnit.health)}/${targetUnit.maxHealth} HP)`)
        }

        if (targetUnit.health <= 0) {
          targetUnit.health = 0
          targetUnit.alive = false
          this.addLog(`${targetUnit.team} unit eliminated!`)
        }
      }
    }
  }

  // Handle medic healing
  handleMedicHealing(unit) {
    if (unit.cooldown > 0) return

    // Find injured allies in range
    const allies = this.state.units.filter(u => 
      u.alive && 
      u.team === unit.team && 
      u.id !== unit.id &&
      u.health < u.maxHealth
    )

    let healTarget = null
    let minHealthRatio = 1

    for (const ally of allies) {
      const distance = this.getDistance(unit.position, ally.position)
      if (distance <= unit.special.healRange) {
        const healthRatio = ally.health / ally.maxHealth
        if (healthRatio < minHealthRatio) {
          minHealthRatio = healthRatio
          healTarget = ally
        }
      }
    }

    if (healTarget) {
      const healAmount = unit.special.healAmount
      healTarget.health = Math.min(healTarget.maxHealth, healTarget.health + healAmount)
      unit.cooldown = unit.special.healCooldown || 3
      
      if (this.state.tick % 5 === 0) {
        this.addLog(`${unit.team} medic healed ally (${Math.round(healTarget.health)}/${healTarget.maxHealth} HP)`)
      }
    }
  }

  // Find closest enemy
  findClosestEnemy(unit, nearPosition = null) {
    const enemies = this.state.units.filter(u => u.alive && u.team !== unit.team)
    const referencePos = nearPosition || unit.position

    let closest = null
    let minDistance = Infinity

    for (const enemy of enemies) {
      const distance = this.getDistance(referencePos, enemy.position)
      if (distance < minDistance) {
        minDistance = distance
        closest = enemy
      }
    }

    return closest
  }

  // Get terrain properties at position
  getTerrainAt(x, y) {
    const terrainTypes = {
      'ground': { speedMultiplier: 1, defenseBonus: 0 },
      'water': { speedMultiplier: 0.1, defenseBonus: -5 },
      'mountain': { speedMultiplier: 0.3, defenseBonus: 10 },
      'forest': { speedMultiplier: 0.5, defenseBonus: 5 },
      'road': { speedMultiplier: 1.5, defenseBonus: 0 },
      'swamp': { speedMultiplier: 0.25, defenseBonus: -3 },
      'desert': { speedMultiplier: 0.8, defenseBonus: -2 },
      'fortress': { speedMultiplier: 1, defenseBonus: 20 }
    }

    if (this.state.terrain && this.state.terrain[y] && this.state.terrain[y][x]) {
      const terrainId = this.state.terrain[y][x]
      return terrainTypes[terrainId] || terrainTypes['ground']
    }
    
    return terrainTypes['ground']
  }

  // Calculate distance between two positions
  getDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Check win conditions
  checkWinCondition() {
    const teamAAlive = this.state.units.filter(u => u.team === 'teamA' && u.alive).length
    const teamBAlive = this.state.units.filter(u => u.team === 'teamB' && u.alive).length

    if (teamAAlive === 0 && teamBAlive === 0) {
      this.state.winner = 'draw'
      this.addLog('Battle ended in a draw - all units eliminated')
      return true
    } else if (teamAAlive === 0) {
      this.state.winner = 'teamB'
      this.addLog('Team B wins!')
      return true
    } else if (teamBAlive === 0) {
      this.state.winner = 'teamA'
      this.addLog('Team A wins!')
      return true
    }

    return false
  }

  // Add log entry
  addLog(message) {
    this.state.logs.push(`[Tick ${this.state.tick}] ${message}`)
    // Keep only last 100 logs to prevent memory issues
    if (this.state.logs.length > 100) {
      this.state.logs.shift()
    }
  }

  // Run full simulation
  async runFull() {
    const initResult = this.initialize()
    if (!initResult.success) {
      return { success: false, error: initResult.error }
    }

    while (this.state.status === 'running' || this.state.status === 'initialized') {
      this.tick()
    }

    return {
      success: true,
      result: {
        winner: this.state.winner,
        totalTicks: this.state.tick,
        finalState: this.state,
        logs: this.state.logs
      }
    }
  }

  // Get current state
  getState() {
    return { ...this.state }
  }

  // Check if simulation is finished
  isFinished() {
    return this.state.status === 'finished'
  }
}
