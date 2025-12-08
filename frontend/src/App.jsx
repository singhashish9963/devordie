import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SimulationProvider } from './context/SimulationContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import TrainingPage from './pages/TrainingPage'
import WarPage from './pages/WarPage'
import WarMode from './pages/WarMode'
import BattleSetup from './pages/BattleSetup'
import BattleViewer from './pages/BattleViewer'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <SimulationProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/war" element={<WarPage />} />
              <Route path="/pvp" element={<WarMode />} />
              <Route path="/war/setup/:battleId" element={<BattleSetup />} />
              <Route path="/pvp/battle/:battleId" element={<BattleViewer />} />
            </Routes>
          </div>
        </Router>
      </SimulationProvider>
    </AuthProvider>
  )
}

export default App
