import React, { createContext, useContext, useState } from 'react'
import { GRID_SIZE, TERRAIN_TYPES, CODE_TEMPLATES } from '../utils/constants'

const SimulationContext = createContext()

export const useSimulationContext = () => {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error('useSimulationContext must be used within SimulationProvider')
  }
  return context
}

export const SimulationProvider = ({ children }) => {
  // Editor State - for configuration before simulation
  const [editorState, setEditorState] = useState({
    terrain: Array(GRID_SIZE.HEIGHT).fill(null).map(() => 
      Array(GRID_SIZE.WIDTH).fill(TERRAIN_TYPES.GROUND.id)
    ),
    units: {
      teamA: [],
      teamB: []
    },
    code: {
      teamA: CODE_TEMPLATES.TEAM_A,
      teamB: CODE_TEMPLATES.TEAM_B
    }
  })

  // Simulation State - live battle state
  const [simulationState, setSimulationState] = useState({
    status: 'idle', // idle, running, paused, finished
    tick: 0,
    units: [],
    logs: [],
    winner: null
  })

  // Update terrain cell
  const updateTerrain = (row, col, terrainType) => {
    setEditorState(prev => {
      const newTerrain = prev.terrain.map(r => [...r])
      newTerrain[row][col] = terrainType
      return { ...prev, terrain: newTerrain }
    })
  }

  // Add unit to team
  const addUnit = (team, unit) => {
    setEditorState(prev => ({
      ...prev,
      units: {
        ...prev.units,
        [team]: [...prev.units[team], { ...unit, id: Date.now() }]
      }
    }))
  }

  // Remove unit
  const removeUnit = (team, unitId) => {
    setEditorState(prev => ({
      ...prev,
      units: {
        ...prev.units,
        [team]: prev.units[team].filter(u => u.id !== unitId)
      }
    }))
  }

  // Update unit configuration
  const updateUnit = (team, unitId, updates) => {
    setEditorState(prev => ({
      ...prev,
      units: {
        ...prev.units,
        [team]: prev.units[team].map(u => 
          u.id === unitId ? { ...u, ...updates } : u
        )
      }
    }))
  }

  // Update team code
  const updateCode = (team, code) => {
    setEditorState(prev => ({
      ...prev,
      code: {
        ...prev.code,
        [team]: code
      }
    }))
  }

  // Set both team codes at once (for loading configurations)
  const setCodeEditors = (codeObject) => {
    setEditorState(prev => ({
      ...prev,
      code: {
        teamA: codeObject.teamA || prev.code.teamA,
        teamB: codeObject.teamB || prev.code.teamB
      }
    }))
  }

  // Reset editor to initial state
  const resetEditor = () => {
    setEditorState({
      terrain: Array(GRID_SIZE.HEIGHT).fill(null).map(() => 
        Array(GRID_SIZE.WIDTH).fill(TERRAIN_TYPES.GROUND.id)
      ),
      units: {
        teamA: [],
        teamB: []
      },
      code: {
        teamA: CODE_TEMPLATES.TEAM_A,
        teamB: CODE_TEMPLATES.TEAM_B
      }
    })
    
    // Also reset simulation state
    setSimulationState({
      status: 'idle',
      tick: 0,
      units: [],
      logs: [],
      winner: null
    })
  }

  const value = {
    editorState,
    simulationState,
    setEditorState,
    setSimulationState,
    updateTerrain,
    addUnit,
    removeUnit,
    updateUnit,
    updateCode,
    setCodeEditors,
    resetEditor
  }

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
