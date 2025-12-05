import React, { useState } from 'react'
import { useSimulationContext } from '../context/SimulationContext'
import '../styles/CodeEditorPanel.css'

const CodeEditorPanel = () => {
  const { editorState, updateCode } = useSimulationContext()
  const [selectedTeam, setSelectedTeam] = useState('teamA')

  const handleCodeChange = (e) => {
    updateCode(selectedTeam, e.target.value)
  }

  return (
    <div className="code-editor-panel">
      <div className="editor-header">
        <h3>AI Strategy Code</h3>
        <div className="team-tabs">
          <button
            className={`tab ${selectedTeam === 'teamA' ? 'active' : ''}`}
            onClick={() => setSelectedTeam('teamA')}
          >
            Team A Code
          </button>
          <button
            className={`tab ${selectedTeam === 'teamB' ? 'active' : ''}`}
            onClick={() => setSelectedTeam('teamB')}
          >
            Team B Code
          </button>
        </div>
      </div>

      <div className="editor-body">
        <textarea
          className="code-textarea"
          value={editorState.code[selectedTeam]}
          onChange={handleCodeChange}
          spellCheck={false}
          placeholder="Write your AI strategy code here..."
        />
      </div>

      <div className="editor-info">
        <p><strong>API Reference:</strong></p>
        <ul>
          <li><code>state.units</code> - Your team's units</li>
          <li><code>state.enemies</code> - Enemy units</li>
          <li><code>state.terrain</code> - Terrain grid</li>
          <li><code>state.tick</code> - Current game tick</li>
        </ul>
        <p><strong>Return:</strong> <code>{`{ action: 'move'|'attack', target: {...} }`}</code></p>
      </div>
    </div>
  )
}

export default CodeEditorPanel
