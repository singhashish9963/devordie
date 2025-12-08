import React, { useState, useEffect } from 'react'
import OTPInput from './OTPInput'
import '../styles/VerifyEmailModal.css'

const VerifyEmailModal = ({ email, onVerify, onResend, onClose }) => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(120) // 2 minutes

  // OTP expiry countdown
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setError('Code expired. Please request a new one.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCountdown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOTPComplete = async (otpValue) => {
    setOtp(otpValue)
    setError('')
    setLoading(true)

    try {
      await onVerify(otpValue)
      setSuccess('Email verified successfully! 🎉')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || loading) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await onResend()
      setSuccess('New code sent to your email! ✅')
      setCountdown(600) // Reset countdown
      setResendCountdown(120)
      setCanResend(false)
      setOtp('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-modal-overlay" onClick={onClose}>
      <div className="verify-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="verify-header">
          <div className="email-icon">📧</div>
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit code to</p>
          <p className="email-display">{email}</p>
        </div>

        <div className="verify-body">
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            disabled={loading || countdown === 0}
          />

          {countdown > 0 && (
            <div className="countdown">
              <span className="countdown-icon">⏱️</span>
              <span>Code expires in {formatTime(countdown)}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {success}
            </div>
          )}

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button
              className={`resend-btn ${!canResend || loading ? 'disabled' : ''}`}
              onClick={handleResend}
              disabled={!canResend || loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : canResend ? (
                '🔄 Resend Code'
              ) : (
                `Wait ${formatTime(resendCountdown)}`
              )}
            </button>
          </div>

          <div className="help-text">
            <p>💡 <strong>Tips:</strong></p>
            <ul>
              <li>Check your spam/junk folder</li>
              <li>Make sure {email} is correct</li>
              <li>Email may take up to 2 minutes to arrive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailModal
