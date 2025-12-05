import React, { useRef, useEffect, useState } from 'react'
import { GRID_SIZE, TERRAIN_TYPES, TEAM_COLORS } from '../utils/constants'

const BattleGrid = ({ terrain, units, onCellClick, showUnits = true }) => {
  const canvasRef = useRef(null)
  const [unitPositions, setUnitPositions] = useState({})

  // Smooth position interpolation
  useEffect(() => {
    if (!units || !Array.isArray(units)) return
    
    const newPositions = {}
    units.forEach(unit => {
      const key = unit.id
      const targetX = unit.position.x
      const targetY = unit.position.y
      
      if (unitPositions[key]) {
        // Interpolate from old to new position
        newPositions[key] = {
          x: unitPositions[key].x + (targetX - unitPositions[key].x) * 0.3,
          y: unitPositions[key].y + (targetY - unitPositions[key].y) * 0.3
        }
      } else {
        // New unit, set position directly
        newPositions[key] = { x: targetX, y: targetY }
      }
    })
    setUnitPositions(newPositions)
  }, [units])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const cellSize = GRID_SIZE.CELL_SIZE

    const animate = () => {
      // Clear canvas with background
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw terrain with no grid lines (smooth battlefield look)
      for (let row = 0; row < GRID_SIZE.HEIGHT; row++) {
        for (let col = 0; col < GRID_SIZE.WIDTH; col++) {
          const terrainId = terrain[row][col]
          const terrainType = Object.values(TERRAIN_TYPES).find(t => t.id === terrainId)
          
          ctx.fillStyle = terrainType?.color || TERRAIN_TYPES.GROUND.color
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }

      // Draw units with smooth animation
      if (showUnits && units && units.length > 0) {
        units.forEach(unit => {
          const pos = unitPositions[unit.id]
          if (!pos) return

          const x = pos.x * cellSize + cellSize / 2
          const y = pos.y * cellSize + cellSize / 2
          const radius = cellSize / 2.5

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.beginPath()
          ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2)
          ctx.fill()

          // Unit circle with gradient background
          const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, radius/4, x, y, radius)
          const baseColor = unit.team === 'teamA' ? TEAM_COLORS.TEAM_A : TEAM_COLORS.TEAM_B
          gradient.addColorStop(0, baseColor + 'CC')
          gradient.addColorStop(1, baseColor)
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()

          // Unit border with glow
          if (unit.alive) {
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 2
            ctx.shadowBlur = 8
            ctx.shadowColor = baseColor
            ctx.stroke()
            ctx.shadowBlur = 0
          }

          // Draw unit type symbol
          ctx.fillStyle = '#fff'
          ctx.font = `bold ${cellSize * 0.5}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 3
          
          let symbol = '●'
          if (unit.type === 'soldier') symbol = '⚔️'
          else if (unit.type === 'archer') symbol = '🏹'
          else if (unit.type === 'tank') symbol = '🛡️'
          else if (unit.type === 'drone') symbol = '🚁'
          else if (unit.type === 'sniper') symbol = '🎯'
          else if (unit.type === 'medic') symbol = '⚕️'
          
          ctx.fillText(symbol, x, y)
          ctx.shadowBlur = 0

          // Health bar (floating above unit)
          const barWidth = cellSize * 0.9
          const barHeight = 6
          const barX = pos.x * cellSize + (cellSize - barWidth) / 2
          const barY = pos.y * cellSize - 8
          
          // Health bar background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
          ctx.fillRect(barX, barY, barWidth, barHeight)
          
          // Health bar fill
          const healthPercent = unit.health / unit.maxHealth
          const healthColor = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336'
          ctx.fillStyle = healthColor
          ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)
          
          // Health bar border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.lineWidth = 1
          ctx.strokeRect(barX, barY, barWidth, barHeight)
        })
      }

      requestAnimationFrame(animate)
    }

    animate()
  }, [terrain, units, showUnits, unitPositions])

  const handleCanvasClick = (e) => {
    if (!onCellClick) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const col = Math.floor(x / GRID_SIZE.CELL_SIZE)
    const row = Math.floor(y / GRID_SIZE.CELL_SIZE)

    if (row >= 0 && row < GRID_SIZE.HEIGHT && col >= 0 && col < GRID_SIZE.WIDTH) {
      onCellClick(row, col)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE.WIDTH * GRID_SIZE.CELL_SIZE}
      height={GRID_SIZE.HEIGHT * GRID_SIZE.CELL_SIZE}
      onClick={handleCanvasClick}
      style={{ 
        border: '2px solid #444',
        cursor: onCellClick ? 'pointer' : 'default',
        display: 'block',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}
    />
  )
}

export default BattleGrid
