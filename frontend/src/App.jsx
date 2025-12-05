import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SimulationProvider } from './context/SimulationContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import TrainingPage from './pages/TrainingPage'
import WarPage from './pages/WarPage'
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
            </Routes>
          </div>
        </Router>
      </SimulationProvider>
    </AuthProvider>
  )
}

export default App
