"use client"

import { useState } from "react"
import { Trash2, Shield, Zap, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../UI/card"
import { Button } from "../UI/Button"
import { Input } from "../UI/input"
import { Label } from "../UI/label"
import { Badge } from "../UI/badge"

export default function ArmyEditor() {
  const [units, setUnits] = useState([])

  const addPreset = (type) => {
    const presets = {
      soldier: { type: "Soldier", health: 100, speed: 3, damage: 15, range: 1, armor: 5 },
      archer: { type: "Archer", health: 60, speed: 2, damage: 20, range: 6, armor: 2 },
      tank: { type: "Tank", health: 200, speed: 1, damage: 10, range: 2, armor: 15 },
      scout: { type: "Scout", health: 50, speed: 5, damage: 8, range: 3, armor: 1 },
    }
    setUnits([...units, { ...presets[type], id: Date.now(), count: 5 }])
  }

  const deleteUnit = (id) => {
    setUnits(units.filter((u) => u.id !== id))
  }

  const updateUnit = (id, field, value) => {
    setUnits(units.map((u) => (u.id === id ? { ...u, [field]: value } : u)))
  }

  const totalUnits = units.reduce((sum, u) => sum + Number(u.count || 0), 0)

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Army Composition
            </CardTitle>
            <CardDescription>Configure unit types and their combat statistics</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/50 text-lg px-3 py-1">
            {totalUnits} Units
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            onClick={() => addPreset("soldier")}
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
          >
            <Shield className="h-4 w-4 mr-2" />
            Soldier
          </Button>
          <Button
            onClick={() => addPreset("archer")}
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
          >
            <Target className="h-4 w-4 mr-2" />
            Archer
          </Button>
          <Button onClick={() => addPreset("tank")} variant="outline" className="border-primary/30 hover:bg-primary/10">
            <Shield className="h-4 w-4 mr-2" />
            Tank
          </Button>
          <Button
            onClick={() => addPreset("scout")}
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
          >
            <Zap className="h-4 w-4 mr-2" />
            Scout
          </Button>
        </div>

        {units.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
            <Shield className="h-12 w-12 text-primary/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No units added yet. Choose a preset above.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {units.map((unit) => (
              <Card key={unit.id} className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{unit.type}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUnit(unit.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Count</Label>
                      <Input
                        type="number"
                        value={unit.count}
                        onChange={(e) => updateUnit(unit.id, "count", e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Health</Label>
                      <Input
                        type="number"
                        value={unit.health}
                        onChange={(e) => updateUnit(unit.id, "health", e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Damage</Label>
                      <Input
                        type="number"
                        value={unit.damage}
                        onChange={(e) => updateUnit(unit.id, "damage", e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Range</Label>
                      <Input
                        type="number"
                        value={unit.range}
                        onChange={(e) => updateUnit(unit.id, "range", e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Speed</Label>
                      <Input
                        type="number"
                        value={unit.speed}
                        onChange={(e) => updateUnit(unit.id, "speed", e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Armor</Label>
                      <Input
                        type="number"
                        value={unit.armor}
                        onChange={(e) => updateUnit(unit.id, "armor", e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-primary/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Effective DPS</span>
                      <span className="text-primary font-semibold">
                        {((unit.damage - 5) / (10 / unit.speed)).toFixed(1)}
                      </span>
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
