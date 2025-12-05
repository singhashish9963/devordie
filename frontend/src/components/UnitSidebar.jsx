import React, { useState } from 'react'
import { useSimulationContext } from '../context/SimulationContext'
import { UNIT_TYPES } from '../utils/constants'
import UnitConfigPanel from './UnitConfigPanel'
import '../styles/UnitSidebar.css'

const UnitSidebar = () => {
  const { editorState, addUnit, removeUnit } = useSimulationContext()
  const [selectedTeam, setSelectedTeam] = useState('teamA')
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [showConfig, setShowConfig] = useState(false)

  const handleAddUnit = (unitType) => {
    const unitTemplate = UNIT_TYPES[unitType.toUpperCase()]
    const currentTeamUnits = editorState.units[selectedTeam] || []
    
    // Spread units out - Team A on left side, Team B on right side
    const baseX = selectedTeam === 'teamA' ? 2 : 17
    const baseY = 5 + (currentTeamUnits.length * 2) % 10
    
    const newUnit = {
      type: unitTemplate.id,
      position: { x: baseX, y: baseY },
      health: unitTemplate.health,
      maxHealth: unitTemplate.health,
      attack: unitTemplate.attack,
      defense: unitTemplate.defense,
      speed: unitTemplate.speed,
      range: unitTemplate.range,
      special: unitTemplate.special || {},
      team: selectedTeam
    }
    addUnit(selectedTeam, newUnit)
  }

  const handleConfigureUnit = (unit) => {
    setSelectedUnit(unit)
    setShowConfig(true)
  }

  const handleRemoveUnit = (unitId) => {
    removeUnit(selectedTeam, unitId)
  }

  const currentUnits = editorState.units[selectedTeam] || []

  return (
    <div className="unit-sidebar">
      <div className="sidebar-header">
        <h3>Unit Configuration</h3>
        <div className="team-selector">
          <button
            className={`team-btn ${selectedTeam === 'teamA' ? 'active' : ''}`}
            onClick={() => setSelectedTeam('teamA')}
          >
            Team A
          </button>
          <button
            className={`team-btn ${selectedTeam === 'teamB' ? 'active' : ''}`}
            onClick={() => setSelectedTeam('teamB')}
          >
            Team B
          </button>
        </div>
      </div>

      <div className="unit-types">
        <h4>Add Units</h4>
        {Object.values(UNIT_TYPES).map(unitType => (
          <button
            key={unitType.id}
            className="add-unit-btn"
            onClick={() => handleAddUnit(unitType.id)}
            title={`${unitType.description} - HP:${unitType.health} ATK:${unitType.attack} SPD:${unitType.speed} RNG:${unitType.range}`}
          >
            <span className="unit-emoji">{unitType.emoji}</span>
            <div className="unit-btn-info">
              <span className="unit-btn-name">{unitType.name}</span>
              {unitType.special && (
                <span className="unit-special-indicator">⭐</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="unit-list">
        <h4>Current Units ({currentUnits.length})</h4>
        {currentUnits.length === 0 ? (
          <p className="empty-message">No units added yet</p>
        ) : (
          <ul>
            {currentUnits.map((unit, index) => (
              <li key={unit.id} className="unit-item">
                <div className="unit-info">
                  <span className="unit-icon" style={{ 
                    backgroundColor: UNIT_TYPES[unit.type.toUpperCase()]?.color 
                  }}></span>
                  <span className="unit-name">
                    {UNIT_TYPES[unit.type.toUpperCase()]?.name} #{index + 1}
                  </span>
                </div>
                <div className="unit-actions">
                  <button 
                    className="config-btn"
                    onClick={() => handleConfigureUnit(unit)}
                    title="Configure"
                  >
                    ⚙️
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveUnit(unit.id)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showConfig && selectedUnit && (
        <UnitConfigPanel
          unit={selectedUnit}
          team={selectedTeam}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  )
}

export default UnitSidebar
