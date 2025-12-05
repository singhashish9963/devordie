import React, { useState } from 'react'
import { useSimulationContext } from '../context/SimulationContext'
import { GRID_SIZE, UNIT_TYPES } from '../utils/constants'
import '../styles/UnitConfigPanel.css'

const UnitConfigPanel = ({ unit, team, onClose }) => {
  const { updateUnit } = useSimulationContext()
  const unitTypeInfo = UNIT_TYPES[unit.type.toUpperCase()]
  const [config, setConfig] = useState({
    position: unit.position,
    health: unit.health,
    attack: unit.attack,
    defense: unit.defense,
    speed: unit.speed,
    range: unit.range
  })

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: field === 'position' ? value : Number(value)
    }))
  }

  const handleSave = () => {
    updateUnit(team, unit.id, config)
    onClose()
  }

  return (
      <div className="config-overlay" onClick={onClose}>
      <div className="config-panel" onClick={(e) => e.stopPropagation()}>
        <div className="config-header">
          <h3>Configure {unitTypeInfo?.emoji} {unitTypeInfo?.name}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {unitTypeInfo?.description && (
          <div className="unit-description">
            <p>{unitTypeInfo.description}</p>
            {unitTypeInfo.special && (
              <div className="special-abilities">
                <strong>⭐ Special Abilities:</strong>
                {unitTypeInfo.special.ignoresTerrain && <span className="ability">Ignores Terrain</span>}
                {unitTypeInfo.special.criticalChance && <span className="ability">Critical: {(unitTypeInfo.special.criticalChance * 100)}%</span>}
                {unitTypeInfo.special.healAmount && <span className="ability">Heals: {unitTypeInfo.special.healAmount} HP</span>}
              </div>
            )}
          </div>
        )}

        <div className="config-body">
          <div className="config-section">
            <h4>Position</h4>
            <div className="input-row">
              <label>
                X:
                <input
                  type="number"
                  min="0"
                  max={GRID_SIZE.WIDTH - 1}
                  value={config.position.x}
                  onChange={(e) => handleChange('position', { ...config.position, x: Number(e.target.value) })}
                />
              </label>
              <label>
                Y:
                <input
                  type="number"
                  min="0"
                  max={GRID_SIZE.HEIGHT - 1}
                  value={config.position.y}
                  onChange={(e) => handleChange('position', { ...config.position, y: Number(e.target.value) })}
                />
              </label>
            </div>
          </div>

          <div className="config-section">
            <h4>Stats</h4>
            <label>
              Health:
              <input
                type="range"
                min="10"
                max="200"
                value={config.health}
                onChange={(e) => handleChange('health', e.target.value)}
              />
              <span>{config.health}</span>
            </label>

            <label>
              Attack:
              <input
                type="range"
                min="5"
                max="50"
                value={config.attack}
                onChange={(e) => handleChange('attack', e.target.value)}
              />
              <span>{config.attack}</span>
            </label>

            <label>
              Defense:
              <input
                type="range"
                min="0"
                max="30"
                value={config.defense}
                onChange={(e) => handleChange('defense', e.target.value)}
              />
              <span>{config.defense}</span>
            </label>

            <label>
              Speed:
              <input
                type="range"
                min="1"
                max="5"
                value={config.speed}
                onChange={(e) => handleChange('speed', e.target.value)}
              />
              <span>{config.speed}</span>
            </label>

            <label>
              Range:
              <input
                type="range"
                min="1"
                max="5"
                value={config.range}
                onChange={(e) => handleChange('range', e.target.value)}
              />
              <span>{config.range}</span>
            </label>
          </div>
        </div>

        <div className="config-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

export default UnitConfigPanel
