"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../UI/card"
import { Badge } from "../UI/badge"
import { Zap, Trophy, Users, Target } from "lucide-react"

export default function ModeSelector({ mode, setMode }) {
  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Game Mode
        </CardTitle>
        <CardDescription>Choose between training and competitive modes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Training Mode */}
          <button
            onClick={() => setMode("training")}
            className={`text-left p-6 rounded-lg border-2 transition-all relative overflow-hidden group ${
              mode === "training"
                ? "border-primary bg-primary/10 glow-cyan"
                : "border-primary/20 bg-card hover:border-primary/40"
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-8 w-8 text-primary" />
                {mode === "training" && <Badge className="bg-primary text-primary-foreground">Active</Badge>}
              </div>
              <h3 className="text-xl font-bold mb-2">Training Mode</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Practice and refine your strategies against AI or other players
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  <span>vs AI or Player 2</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>No ranking impact</span>
                </div>
              </div>
            </div>
            {mode === "training" && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            )}
          </button>

          {/* Real Mode */}
          <button
            onClick={() => setMode("real")}
            className={`text-left p-6 rounded-lg border-2 transition-all relative overflow-hidden group ${
              mode === "real"
                ? "border-secondary bg-secondary/10 glow-orange"
                : "border-secondary/20 bg-card hover:border-secondary/40"
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Trophy className="h-8 w-8 text-secondary" />
                {mode === "real" && <Badge className="bg-secondary text-secondary-foreground">Active</Badge>}
              </div>
              <h3 className="text-xl font-bold mb-2">Real Battle</h3>
              <p className="text-sm text-muted-foreground mb-4">Compete in ranked matches against other players</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-secondary" />
                  <span>Ranked matches</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-secondary" />
                  <span>Player vs Player only</span>
                </div>
              </div>
            </div>
            {mode === "real" && <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent" />}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
