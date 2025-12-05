import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/WarPage.css'

const WarPage = () => {
  const navigate = useNavigate()

  return (
    <div className="war-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>War Mode</h1>
      </header>

      <div className="war-container">
        <div className="coming-soon">
          <div className="war-icon">⚔️</div>
          <h2>War Mode Coming Soon</h2>
          <p>Competitive multiplayer battles will be available in a future update.</p>
          
          <div className="planned-features">
            <h3>Planned Features:</h3>
            <ul>
              <li>🎮 Real-time multiplayer battles</li>
              <li>🏆 Global ranking and leaderboards</li>
              <li>🎪 Tournament system</li>
              <li>👥 Team battles (2v2, 3v3)</li>
              <li>📊 Match history and statistics</li>
              <li>🎥 Replay system</li>
              <li>💬 Live chat and spectator mode</li>
            </ul>
          </div>

          <button className="notify-btn">
            🔔 Notify Me When Available
          </button>

          <button className="back-training-btn" onClick={() => navigate('/training')}>
            Return to Training Mode
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarPage
