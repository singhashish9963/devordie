import React, { useState, useEffect } from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { useSimulationContext } from '../context/SimulationContext'
import { SIMULATION_STATUS } from '../utils/constants'
import BattleGrid from './BattleGrid'
import { checkHealth } from '../api'
import '../styles/SimulationControls.css'

const SimulationControls = () => {
  const { 
    simulationState, 
    startSimulation, 
    pauseSimulation, 
    resumeSimulation,
    stopSimulation, 
    stepSimulation 
  } = useSimulation()
  
  const { editorState, resetEditor } = useSimulationContext()
  const [backendStatus, setBackendStatus] = useState('checking')

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await checkHealth()
        setBackendStatus(health.status === 'ok' ? 'connected' : 'error')
      } catch (error) {
        setBackendStatus('disconnected')
      }
    }
    
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30s
    
    return () => clearInterval(interval)
  }, [])

  const isIdle = simulationState.status === SIMULATION_STATUS.IDLE
  const isRunning = simulationState.status === SIMULATION_STATUS.RUNNING
  const isPaused = simulationState.status === SIMULATION_STATUS.PAUSED
  const isFinished = simulationState.status === SIMULATION_STATUS.FINISHED

  const canStart = isIdle || isFinished
  const canPause = isRunning
  const canResume = isPaused
  const canStop = !isIdle
  const canStep = isIdle || isPaused

  return (
    <div className="simulation-controls">
      <div className="controls-header">
        <h3>Simulation</h3>
        <div className="header-right">
          <div className={`backend-status ${backendStatus}`} title={`Backend: ${backendStatus}`}>
            <span className="status-dot"></span>
            {backendStatus === 'connected' ? 'Backend' : backendStatus === 'checking' ? 'Checking...' : 'Offline'}
          </div>
          <div className="status-badge" data-status={simulationState.status}>
            {simulationState.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="controls-buttons">
        <button
          className="control-btn start"
          onClick={startSimulation}
          disabled={!canStart || backendStatus !== 'connected'}
          title={backendStatus !== 'connected' ? 'Backend not connected' : ''}
        >
          ▶ Start
        </button>
        <button
          className="control-btn pause"
          onClick={pauseSimulation}
          disabled={true}
          title="Pause not supported with backend (use step mode)"
        >
          ⏸ Pause
        </button>

        <button
          className="control-btn step"
          onClick={stepSimulation}
          disabled={!canStep || backendStatus !== 'connected'}
        >
          ⏭ Step
        </button>

        <button
          className="control-btn stop"
          onClick={stopSimulation}
          disabled={!canStop}
        >
          ⏹ Stop
        </button>

        <button
          className="control-btn reset"
          onClick={resetEditor}
          disabled={isRunning}
        >
          🔄 Reset All
        </button>
      </div>

      <div className="simulation-display">
        {simulationState.status !== SIMULATION_STATUS.IDLE ? (
          <div className="simulation-stats">
            <div className="stat-item">
              <span className="stat-label">Tick:</span>
              <span className="stat-value">{simulationState.tick}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Team A:</span>
              <span className="stat-value team-a">
                {simulationState.units.filter(u => u.team === 'teamA' && u.alive).length} alive
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Team B:</span>
              <span className="stat-value team-b">
                {simulationState.units.filter(u => u.team === 'teamB' && u.alive).length} alive
              </span>
            </div>
            {simulationState.winner && (
              <div className="stat-item winner-stat">
                <span className="stat-label">Winner:</span>
                <span className="stat-value winner">{simulationState.winner.toUpperCase()}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="idle-message">
            <p>Configure your battlefield and click Start to begin simulation</p>
          </div>
        )}
      </div>

      <div className="simulation-logs">
        <h4>Battle Log</h4>
        <div className="logs-container">
          {simulationState.logs.length === 0 ? (
            <p className="empty-log">No logs yet</p>
          ) : (
            simulationState.logs.slice(-10).map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SimulationControls
