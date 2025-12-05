"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../UI/card"
import { Button } from "../UI/Button"
import { Input } from "../UI/input"
import { Label } from "../UI/label"
import { Badge } from "../UI/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/select"
import { Trash2, Shield, Target, Users } from "lucide-react"

export default function OpponentConfig({ mode }) {
  const [opponent, setOpponent] = useState({
    name: mode === "training" ? "AI Commander" : "Player 2",
    difficulty: "balanced",
    units: [],
  })

  const addPreset = (type) => {
    const presets = {
      soldier: { type: "Soldier", health: 100, speed: 3, damage: 15, range: 1, armor: 5 },
      archer: { type: "Archer", health: 60, speed: 2, damage: 20, range: 6, armor: 2 },
      tank: { type: "Tank", health: 200, speed: 1, damage: 10, range: 2, armor: 15 },
    }
    setOpponent({
      ...opponent,
      units: [...opponent.units, { ...presets[type], id: Date.now(), count: 5 }],
    })
  }

  const deleteUnit = (id) => {
    setOpponent({
      ...opponent,
      units: opponent.units.filter((u) => u.id !== id),
    })
  }

  const scaleArmy = (factor) => {
    setOpponent({
      ...opponent,
      units: opponent.units.map((u) => ({ ...u, count: Math.max(1, Math.round(u.count * factor)) })),
    })
  }

  const totalUnits = opponent.units.reduce((sum, u) => sum + Number(u.count || 0), 0)

  return (
    <Card className="border-destructive/30 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-destructive" />
              {mode === "training" ? "Opponent Configuration" : "Player 2 Army"}
            </CardTitle>
            <CardDescription>
              {mode === "training" ? "Configure AI opponent or Player 2 army" : "Configure Player 2's army composition"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-destructive/50 text-lg px-3 py-1">
            {totalUnits} Units
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Opponent Details */}
        <div className="grid md:grid-cols-2 gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="space-y-2">
            <Label>Opponent Name</Label>
            <Input
              value={opponent.name}
              onChange={(e) => setOpponent({ ...opponent, name: e.target.value })}
              className="border-destructive/30"
            />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={opponent.difficulty}
              onValueChange={(value) => setOpponent({ ...opponent, difficulty: value })}
            >
              <SelectTrigger className="border-destructive/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weak">Weak (0.7x)</SelectItem>
                <SelectItem value="balanced">Balanced (1.0x)</SelectItem>
                <SelectItem value="strong">Strong (1.3x)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => scaleArmy(0.5)}
            variant="outline"
            size="sm"
            className="border-destructive/30"
            disabled={opponent.units.length === 0}
          >
            Halve Army
          </Button>
          <Button
            onClick={() => scaleArmy(1.5)}
            variant="outline"
            size="sm"
            className="border-destructive/30"
            disabled={opponent.units.length === 0}
          >
            1.5x Army
          </Button>
          <Button
            onClick={() => scaleArmy(2)}
            variant="outline"
            size="sm"
            className="border-destructive/30"
            disabled={opponent.units.length === 0}
          >
            Double Army
          </Button>
        </div>

        {/* Unit Presets */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => addPreset("soldier")}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10"
          >
            <Shield className="h-4 w-4 mr-2" />
            Soldier
          </Button>
          <Button
            onClick={() => addPreset("archer")}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10"
          >
            <Target className="h-4 w-4 mr-2" />
            Archer
          </Button>
          <Button
            onClick={() => addPreset("tank")}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10"
          >
            <Shield className="h-4 w-4 mr-2" />
            Tank
          </Button>
        </div>

        {/* Unit List */}
        {opponent.units.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-destructive/20 rounded-lg bg-destructive/5">
            <Users className="h-12 w-12 text-destructive/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No opponent units configured</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {opponent.units.map((unit) => (
              <Card key={unit.id} className="border-destructive/20 bg-gradient-to-br from-card to-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{unit.type}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUnit(unit.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Count:</span>
                      <div className="font-semibold">{unit.count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">HP:</span>
                      <div className="font-semibold">{unit.health}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DMG:</span>
                      <div className="font-semibold">{unit.damage}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
