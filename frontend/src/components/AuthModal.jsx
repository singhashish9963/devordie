import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Login from './Login'
import Signup from './Signup'
import VerifyEmailModal from './VerifyEmailModal'
import ForgotPasswordModal from './ForgotPasswordModal'
import '../styles/Auth.css'

const AuthModal = ({ onClose }) => {
  const [mode, setMode] = useState('login')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { needsVerification, verificationEmail, verifyEmail, resendOTP } = useAuth()

  if (showForgotPassword) {
    return (
      <ForgotPasswordModal
        onClose={() => setShowForgotPassword(false)}
        onSuccess={() => {
          setShowForgotPassword(false)
          setMode('login')
        }}
      />
    )
  }

  if (needsVerification && verificationEmail) {
    return (
      <VerifyEmailModal
        email={verificationEmail}
        onVerify={verifyEmail}
        onResend={resendOTP}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✕</button>
        
        {mode === 'login' ? (
          <Login
            onSwitchToSignup={() => setMode('signup')}
            onForgotPassword={() => setShowForgotPassword(true)}
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
