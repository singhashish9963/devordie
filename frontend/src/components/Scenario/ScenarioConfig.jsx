"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../UI/card"
import { Button } from "../UI/Button"
import { Label } from "../UI/label"
import { Slider } from "../UI/slider"
import { Badge } from "../UI/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/select"
import { Map, Target, Zap } from "lucide-react"

export default function ScenarioConfig() {
  const [scenario, setScenario] = useState({
    template: "skirmish",
    mapSize: 50,
    obstacles: 10,
    winCondition: "destroy_all",
    timeLimit: 300,
    simSpeed: 1,
  })

  const templates = {
    skirmish: { mapSize: 40, obstacles: 5, winCondition: "destroy_all", timeLimit: 120 },
    siege: { mapSize: 60, obstacles: 30, winCondition: "capture_base", timeLimit: 300 },
    survival: { mapSize: 50, obstacles: 15, winCondition: "survive", timeLimit: 600 },
  }

  const loadTemplate = (template) => {
    setScenario({ ...scenario, ...templates[template], template })
  }

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          Scenario Configuration
        </CardTitle>
        <CardDescription>Define battlefield parameters and victory conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-3">
          <Label>Scenario Templates</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(templates).map((template) => (
              <Button
                key={template}
                onClick={() => loadTemplate(template)}
                variant={scenario.template === template ? "default" : "outline"}
                className={scenario.template === template ? "glow-cyan" : "border-primary/30"}
              >
                {template.charAt(0).toUpperCase() + template.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Map Configuration */}
        <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
          <h3 className="font-semibold flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" />
            Map Settings
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Map Size</Label>
                <Badge variant="outline" className="border-primary/50">
                  {scenario.mapSize}x{scenario.mapSize}
                </Badge>
              </div>
              <Slider
                value={[scenario.mapSize]}
                onValueChange={([value]) => setScenario({ ...scenario, mapSize: value })}
                min={20}
                max={100}
                step={10}
                className="cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Obstacles</Label>
                <Badge variant="outline" className="border-primary/50">
                  {scenario.obstacles}%
                </Badge>
              </div>
              <Slider
                value={[scenario.obstacles]}
                onValueChange={([value]) => setScenario({ ...scenario, obstacles: value })}
                min={0}
                max={40}
                step={5}
              />
            </div>
          </div>
        </div>

        {/* Victory Conditions */}
        <div className="space-y-4 p-4 border border-secondary/20 rounded-lg bg-secondary/5">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-secondary" />
            Victory Conditions
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Win Condition</Label>
              <Select
                value={scenario.winCondition}
                onValueChange={(value) => setScenario({ ...scenario, winCondition: value })}
              >
                <SelectTrigger className="border-secondary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="destroy_all">Destroy All Enemies</SelectItem>
                  <SelectItem value="survive">Survive Time Limit</SelectItem>
                  <SelectItem value="capture_base">Capture Base</SelectItem>
                  <SelectItem value="score">Reach Score Threshold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Time Limit</Label>
                <Badge variant="outline" className="border-secondary/50">
                  {Math.floor(scenario.timeLimit / 60)}:{(scenario.timeLimit % 60).toString().padStart(2, "0")}
                </Badge>
              </div>
              <Slider
                value={[scenario.timeLimit]}
                onValueChange={([value]) => setScenario({ ...scenario, timeLimit: value })}
                min={60}
                max={600}
                step={30}
              />
            </div>
          </div>
        </div>

        {/* Simulation Settings */}
        <div className="space-y-3 p-4 border border-accent/20 rounded-lg bg-accent/5">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            Simulation Speed
          </h3>
          <div>
            <div className="flex justify-between mb-2">
              <Label>Playback Speed</Label>
              <Badge variant="outline" className="border-accent/50">
                {scenario.simSpeed}x
              </Badge>
            </div>
            <Slider
              value={[scenario.simSpeed]}
              onValueChange={([value]) => setScenario({ ...scenario, simSpeed: value })}
              min={0.5}
              max={4}
              step={0.5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
