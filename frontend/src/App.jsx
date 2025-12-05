"use client"


import { useState } from "react"
import { Swords, Zap, Settings, BarChart3 } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/UI/tabs"
import { Card } from "./components/UI/card"
import { Badge } from "./components/UI/badge"
import { Button } from "./components/UI/Button"

import RuleBuilder from "./components/Rule/RuleBuilder"
import ArmyEditor from "./components/Army/ArmyEditor"
import ScenarioConfig from "./components/Scenario/ScenarioConfig"
import OpponentConfig from "./components/Opponent/OpponentConfig"
import ModeSelector from "./components/Mode/ModeSelector"
import BattleGrid from "./components/BattleGrid/BattleGrid"


export default function App() {
  const [mode, setMode] = useState("training")
  const [battleMode, setBattleMode] = useState(false)
  const [battling, setBattling] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/20">
      {/* Header with glow effect */}
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Swords className="h-8 w-8 text-primary glow-cyan" />
                <div className="absolute inset-0 bg-primary/20 blur-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-cyan-300 to-primary bg-clip-text text-transparent">
                  AIBattleForge
                </h1>
                <p className="text-xs text-muted-foreground">
                  Autonomous Battle Simulation Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-primary/50 text-primary">
                <Zap className="h-3 w-3 mr-1" />
                {mode === "training" ? "Training Mode" : "Real Battle"}
              </Badge>
              <Button
                onClick={() => setBattleMode(!battleMode)}
                variant={battleMode ? "default" : "outline"}
                className={battleMode ? "glow-cyan" : ""}
              >
                {battleMode ? "Configure" : "Battle View"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!battleMode ? (
          /* Configuration Mode */
          <div className="space-y-6">
            {/* Welcome Banner */}
            <Card className="border-primary/30 bg-gradient-to-r from-card via-card to-primary/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-pretty">
                    Design Your Army&apos;s Intelligence
                  </h2>
                  <p className="text-sm text-muted-foreground text-balance">
                    Define behavioral rules for your units, configure your army composition, and watch
                    your autonomous strategies compete in real-time tactical simulations.
                  </p>
                </div>
                <Button
                  onClick={() => setBattleMode(true)}
                  size="lg"
                  className="glow-cyan bg-primary hover:bg-primary/90"
                  disabled={!battling}
                >
                  <Swords className="h-4 w-4 mr-2" />
                  Start Battle
                </Button>
              </div>
            </Card>

            {/* Configuration Tabs */}
            <Tabs defaultValue="mode" className="space-y-6">
              <TabsList className="grid grid-cols-5 gap-2 bg-card/50 p-1 backdrop-blur">
                <TabsTrigger
                  value="mode"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Mode
                </TabsTrigger>
                <TabsTrigger
                  value="rules"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Rules
                </TabsTrigger>
                <TabsTrigger
                  value="army"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Swords className="h-4 w-4 mr-2" />
                  Army
                </TabsTrigger>
                <TabsTrigger
                  value="opponent"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Swords className="h-4 w-4 mr-2 rotate-180" />
                  Opponent
                </TabsTrigger>
                <TabsTrigger
                  value="scenario"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Scenario
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mode">
                <ModeSelector mode={mode} setMode={setMode} />
              </TabsContent>

              <TabsContent value="rules">
                <RuleBuilder />
              </TabsContent>

              <TabsContent value="army">
                <ArmyEditor />
              </TabsContent>

              <TabsContent value="opponent">
                <OpponentConfig mode={mode} />
              </TabsContent>

              <TabsContent value="scenario">
                <ScenarioConfig />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Battle Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BattleGrid battling={battling} setBattling={setBattling} />
            </div>
            <div>
              <StatsPanel />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

