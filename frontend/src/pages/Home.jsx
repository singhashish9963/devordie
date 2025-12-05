import React from 'react'
import { useNavigate } from 'react-router-dom'
import UserMenu from '../components/UserMenu'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <div className="header-content">
            <div>
              <h1>DevOrDie</h1>
              <p className="tagline">Battle Simulator - Code Your Army, Dominate the Battlefield</p>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="mode-selection">
          <div className="mode-card" onClick={() => navigate('/training')}>
            <div className="mode-icon">🎯</div>
            <h2>Training Mode</h2>
            <p>Design battlefields, configure units, and test AI strategies in a controlled environment</p>
            <ul className="mode-features">
              <li>Custom terrain editor</li>
              <li>Unit configuration</li>
              <li>Code editor for AI logic</li>
              <li>Step-by-step simulation</li>
            </ul>
            <button className="mode-btn">Enter Training</button>
          </div>

          <div className="mode-card" onClick={() => navigate('/war')}>
            <div className="mode-icon">⚔️</div>
            <h2>War Mode</h2>
            <p>Deploy your trained armies in competitive battles against other players</p>
            <ul className="mode-features">
              <li>Multiplayer battles</li>
              <li>Ranking system</li>
              <li>Tournament mode</li>
              <li>Spectator view</li>
            </ul>
            <button className="mode-btn war">Coming Soon</button>
          </div>
        </div>

        <footer className="home-footer">
          <p>Build your strategy with code. Watch your armies fight autonomously.</p>
        </footer>
      </div>
    </div>
  )
}

export default Home
