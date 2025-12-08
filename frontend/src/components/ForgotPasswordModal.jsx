import React, { useState } from 'react'
import OTPInput from './OTPInput'
import '../styles/ForgotPasswordModal.css'

const ForgotPasswordModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Reset code sent to your email! ✅')
        setTimeout(() => {
          setStep(2)
          setSuccess('')
        }, 1500)
      } else {
        setError(data.message || 'Failed to send reset code')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (otpValue) => {
    setOtp(otpValue)
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Code verified! ✅')
        setTimeout(() => {
          setStep(3)
          setSuccess('')
        }, 1000)
      } else {
        setError(data.message || 'Invalid code')
        setOtp('')
      }
    } catch (err) {
      setError('Failed to verify code')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Password reset successfully! 🎉')
        setTimeout(() => {
          onSuccess && onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('New code sent! ✅')
        setOtp('')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to resend code')
      }
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-modal-overlay" onClick={onClose}>
      <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="forgot-header">
          <div className="lock-icon">🔒</div>
          <h2>Reset Password</h2>
          <p>
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && "Enter the code sent to your email"}
            {step === 3 && "Create a new password"}
          </p>
        </div>

        <div className="forgot-body">
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && <div className="error-message">⚠️ {error}</div>}
              {success && <div className="success-message">✅ {success}</div>}

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  '📧 Send Reset Code'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <div className="otp-step">
              <p className="email-sent-to">Code sent to: <strong>{email}</strong></p>
              
              <OTPInput
                length={6}
                onComplete={handleVerifyOTP}
                disabled={loading}
              />

              {error && <div className="error-message">⚠️ {error}</div>}
              {success && <div className="success-message">✅ {success}</div>}

              <button
                className="resend-link"
                onClick={handleResendOTP}
                disabled={loading}
              >
                🔄 Resend Code
              </button>

              <button
                className="back-link"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Change Email
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  minLength={6}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              {error && <div className="error-message">⚠️ {error}</div>}
              {success && <div className="success-message">✅ {success}</div>}

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting...
                  </>
                ) : (
                  '🔐 Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Progress indicator */}
          <div className="progress-indicator">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordModal
