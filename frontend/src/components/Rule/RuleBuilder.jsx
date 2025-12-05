"use client"

import { useState } from "react"
import { Plus, Trash2, Copy, ChevronUp, ChevronDown, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../UI/card"
import { Button } from "../UI/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/select"
import { Input } from "../UI/input"
import { Label } from "../UI/label"
import { Badge } from "../UI/badge"

export default function RuleBuilder() {
  const [rules, setRules] = useState([])

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now(),
        priority: rules.length + 1,
        condition: "enemy_near",
        conditionValue: 5,
        action: "attack",
        actionValue: "",
      },
    ])
  }

  const deleteRule = (id) => {
    setRules(rules.filter((r) => r.id !== id))
  }

  const duplicateRule = (rule) => {
    setRules([...rules, { ...rule, id: Date.now(), priority: rules.length + 1 }])
  }

  const moveRule = (index, direction) => {
    const newRules = [...rules]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < newRules.length) {
      ;[newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]]
      setRules(newRules)
    }
  }

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Behavioral Rules
            </CardTitle>
            <CardDescription>Define IF-THEN logic for unit behavior. Rules execute in priority order.</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/50">
            {rules.length} {rules.length === 1 ? "Rule" : "Rules"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
            <Zap className="h-12 w-12 text-primary/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No rules defined yet</p>
            <Button onClick={addRule} className="glow-cyan">
              <Plus className="h-4 w-4 mr-2" />
              Create First Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <Card key={rule.id} className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveRule(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Badge className="h-6 w-6 flex items-center justify-center bg-primary/20 text-primary">
                        {index + 1}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveRule(index, "down")}
                        disabled={index === rules.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-primary">IF Condition</Label>
                        <Select defaultValue={rule.condition}>
                          <SelectTrigger className="border-primary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enemy_near">Enemy Near</SelectItem>
                            <SelectItem value="enemy_far">Enemy Far</SelectItem>
                            <SelectItem value="health_low">Health Low</SelectItem>
                            <SelectItem value="health_high">Health High</SelectItem>
                            <SelectItem value="ally_near">Ally Near</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Range/Threshold"
                          defaultValue={rule.conditionValue}
                          className="border-primary/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-secondary">THEN Action</Label>
                        <Select defaultValue={rule.action}>
                          <SelectTrigger className="border-secondary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attack">Attack</SelectItem>
                            <SelectItem value="retreat">Retreat</SelectItem>
                            <SelectItem value="defend">Defend</SelectItem>
                            <SelectItem value="patrol">Patrol</SelectItem>
                            <SelectItem value="support">Support Ally</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => duplicateRule(rule)} className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRule(rule.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {rules.length > 0 && (
          <Button onClick={addRule} variant="outline" className="w-full border-primary/30 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
