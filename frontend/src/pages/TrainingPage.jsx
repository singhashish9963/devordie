import React from 'react'
import { useNavigate } from 'react-router-dom'
import TerrainEditor from '../components/TerrainEditor'
import UnitSidebar from '../components/UnitSidebar'
import CodeEditorPanel from '../components/CodeEditorPanel'
import SimulationControls from '../components/SimulationControls'
import '../styles/TrainingPage.css'

const TrainingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="training-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Training Mode</h1>
        <div className="header-actions">
          <button className="save-btn">💾 Save Configuration</button>
          <button className="load-btn">📂 Load Configuration</button>
        </div>
      </header>

      <div className="training-layout">
        {/* Left Panel - Terrain & Map */}
        <div className="panel left-panel">
          <TerrainEditor />
        </div>

        {/* Middle Panel - Units */}
        <div className="panel middle-panel">
          <UnitSidebar />
        </div>

        {/* Right Panel - Code & Simulation */}
        <div className="panel right-panel">
          <div className="right-top">
            <CodeEditorPanel />
          </div>
          <div className="right-bottom">
            <SimulationControls />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainingPage
