import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TerrainEditor from '../components/TerrainEditor'
import UnitSidebar from '../components/UnitSidebar'
import CodeEditorPanel from '../components/CodeEditorPanel'
import SimulationControls from '../components/SimulationControls'
import ConfigManager from '../components/ConfigManager'
import EngineBenchmark from '../components/EngineBenchmark'
import UserMenu from '../components/UserMenu'
import '../styles/TrainingPage.css'

const TrainingPage = () => {
  const navigate = useNavigate()
  const [showConfigManager, setShowConfigManager] = useState(false)
  const [showBenchmark, setShowBenchmark] = useState(false)

  return (
    <div className="training-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Training Mode</h1>
        <div className="header-actions">
          <button className="save-load-btn benchmark" onClick={() => setShowBenchmark(true)}>
            ⚡ Engine Benchmark
          </button>
          <button className="save-load-btn" onClick={() => setShowConfigManager(true)}>
            💾 Save / Load
          </button>
          <UserMenu />
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

      {showConfigManager && (
        <ConfigManager onClose={() => setShowConfigManager(false)} />
      )}

      {showBenchmark && (
        <EngineBenchmark onClose={() => setShowBenchmark(false)} />
      )}
    </div>
  )
}

export default TrainingPage
