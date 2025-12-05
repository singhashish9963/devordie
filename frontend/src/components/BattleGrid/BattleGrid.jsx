"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card"
import { Button } from "../UI/Button"
import { Badge } from "../UI/badge"
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Swords } from "lucide-react"

export default function BattleGrid({ battling, setBattling }) {
  const canvasRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [frame, setFrame] = useState(0)
  const unitsRef = useRef([])
  const animationRef = useRef(null)

  // Initialize demo units
  useEffect(() => {
    unitsRef.current = [
      // Player units (cyan, left side)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `player-${i}`,
        x: 50 + Math.random() * 100,
        y: 50 + i * 50 + Math.random() * 30,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        health: 100,
        maxHealth: 100,
        team: "player",
      })),
      // Opponent units (red, right side)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `opponent-${i}`,
        x: 650 + Math.random() * 100,
        y: 50 + i * 50 + Math.random() * 30,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        health: 100,
        maxHealth: 100,
        team: "opponent",
        attackCooldown: 0,
      })),
    ]
  }, [])

  // Battle simulation loop
  useEffect(() => {
    if (!battling || isPaused) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)"
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = "rgba(34, 211, 238, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Update and draw units
      const playerUnits = unitsRef.current.filter((u) => u.team === "player" && u.health > 0)
      const opponentUnits = unitsRef.current.filter((u) => u.team === "opponent" && u.health > 0)

      unitsRef.current.forEach((unit) => {
        if (unit.health <= 0) return

        // Update position
        unit.x += unit.vx
        unit.y += unit.vy

        // Bounce off walls
        if (unit.x < 10 || unit.x > width - 10) unit.vx *= -1
        if (unit.y < 10 || unit.y > height - 10) unit.vy *= -1

        // Random direction change
        if (Math.random() < 0.01) {
          unit.vx = Math.random() * 2 - 1
          unit.vy = Math.random() * 2 - 1
        }

        // Combat logic
        unit.attackCooldown = Math.max(0, (unit.attackCooldown || 0) - 1)
        const enemies = unit.team === "player" ? opponentUnits : playerUnits
        enemies.forEach((enemy) => {
          const dx = enemy.x - unit.x
          const dy = enemy.y - unit.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const attackRange = 40

          if (distance < attackRange && unit.attackCooldown === 0) {
            // Deal damage
            const damage = 5
            enemy.health = Math.max(0, enemy.health - damage)
            unit.attackCooldown = 30

            // Draw attack line
            ctx.strokeStyle = unit.team === "player" ? "rgba(34, 211, 238, 0.5)" : "rgba(239, 68, 68, 0.5)"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(unit.x, unit.y)
            ctx.lineTo(enemy.x, enemy.y)
            ctx.stroke()
          }
        })

        // Draw unit
        const color = unit.team === "player" ? "#22d3ee" : "#ef4444"
        const glowColor = unit.team === "player" ? "rgba(34, 211, 238, 0.3)" : "rgba(239, 68, 68, 0.3)"

        // Glow effect
        ctx.shadowBlur = 20
        ctx.shadowColor = glowColor
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(unit.x, unit.y, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Health bar
        const healthPercent = unit.health / unit.maxHealth
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(unit.x - 10, unit.y - 18, 20, 3)
        ctx.fillStyle = healthPercent > 0.5 ? "#22c55e" : healthPercent > 0.25 ? "#f59e0b" : "#ef4444"
        ctx.fillRect(unit.x - 10, unit.y - 18, 20 * healthPercent, 3)
      })

      setFrame((f) => f + 1)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [battling, isPaused])

  const handleReset = () => {
    setFrame(0)
    setBattling(false)
    setIsPaused(false)
    // Reinitialize units
    unitsRef.current = [
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `player-${i}`,
        x: 50 + Math.random() * 100,
        y: 50 + i * 50 + Math.random() * 30,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        health: 100,
        maxHealth: 100,
        team: "player",
        attackCooldown: 0,
      })),
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `opponent-${i}`,
        x: 650 + Math.random() * 100,
        y: 50 + i * 50 + Math.random() * 30,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        health: 100,
        maxHealth: 100,
        team: "opponent",
        attackCooldown: 0,
      })),
    ]
  }

  const alivePlayer = unitsRef.current.filter((u) => u.team === "player" && u.health > 0).length
  const aliveOpponent = unitsRef.current.filter((u) => u.team === "opponent" && u.health > 0).length

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur tactical-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary glow-cyan" />
            Battle Visualizer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/50">
              <div className="h-2 w-2 bg-primary rounded-full mr-2 animate-pulse" />
              {alivePlayer} vs {aliveOpponent}
            </Badge>
            <Badge variant="outline" className="border-primary/50">
              Frame {frame}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="relative rounded-lg overflow-hidden border border-primary/20 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-auto"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setBattling(true)
                setIsPaused(false)
              }}
              disabled={battling && !isPaused}
              className="glow-cyan"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
            <Button onClick={() => setIsPaused(!isPaused)} disabled={!battling} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} variant="outline" size="icon">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button onClick={() => setZoom(Math.min(2, zoom + 0.1))} variant="outline" size="icon">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

