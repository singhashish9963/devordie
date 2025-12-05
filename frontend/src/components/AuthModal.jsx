import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import '../styles/Auth.css'

const AuthModal = ({ onClose }) => {
  const [mode, setMode] = useState('login')

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✕</button>
        
        {mode === 'login' ? (
          <Login
            onSwitchToSignup={() => setMode('signup')}
            onClose={onClose}
          />
        ) : (
          <Signup
            onSwitchToLogin={() => setMode('login')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

export default AuthModal
