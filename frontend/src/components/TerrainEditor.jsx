import React, { useState } from 'react'
import { useSimulationContext } from '../context/SimulationContext'
import { TERRAIN_TYPES, SIMULATION_STATUS } from '../utils/constants'
import BattleGrid from './BattleGrid'
import '../styles/TerrainEditor.css'

const TerrainEditor = () => {
  const { editorState, simulationState, updateTerrain } = useSimulationContext()
  const [selectedTerrain, setSelectedTerrain] = useState(TERRAIN_TYPES.GROUND.id)

  const handleCellClick = (row, col) => {
    // Only allow terrain editing when not simulating
    if (simulationState.status === SIMULATION_STATUS.IDLE) {
      updateTerrain(row, col, selectedTerrain)
    }
  }

  // Show simulation units when running, otherwise show editor units
  const isSimulating = simulationState.status !== SIMULATION_STATUS.IDLE
  const simulationUnits = Array.isArray(simulationState.units) ? simulationState.units : []
  const editorUnits = [...(editorState.units.teamA || []), ...(editorState.units.teamB || [])]
  const displayUnits = isSimulating ? simulationUnits : editorUnits

  return (
    <div className="terrain-editor">
      <div className="terrain-header">
        <h3>Terrain Editor</h3>
        <div className="terrain-tools">
          {Object.values(TERRAIN_TYPES).map(terrain => (
            <button
              key={terrain.id}
              className={`terrain-btn ${selectedTerrain === terrain.id ? 'active' : ''}`}
              onClick={() => setSelectedTerrain(terrain.id)}
              style={{ backgroundColor: terrain.color }}
              title={`${terrain.name} - ${terrain.description}`}
            >
              {terrain.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid-container">
        <BattleGrid 
          terrain={editorState.terrain}
          units={displayUnits}
          onCellClick={handleCellClick}
          showUnits={true}
        />
      </div>

      <div className="terrain-info">
        {isSimulating ? (
          <p><strong>Simulation Running</strong> - Terrain editing disabled</p>
        ) : (
          <>
            <p>Click on the grid to paint terrain</p>
            <div className="selected-terrain-info">
              <strong>{TERRAIN_TYPES[selectedTerrain.toUpperCase()]?.name}</strong>
              <div className="terrain-stats">
                <span>⚡ Speed: {Math.round((TERRAIN_TYPES[selectedTerrain.toUpperCase()]?.speedMultiplier || 1) * 100)}%</span>
                <span>🛡️ Defense: {TERRAIN_TYPES[selectedTerrain.toUpperCase()]?.defenseBonus > 0 ? '+' : ''}{TERRAIN_TYPES[selectedTerrain.toUpperCase()]?.defenseBonus || 0}</span>
              </div>
              <p className="terrain-desc">{TERRAIN_TYPES[selectedTerrain.toUpperCase()]?.description}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TerrainEditor
