import React, { useState, useRef, useEffect } from 'react'
import '../styles/OTPInput.css'

const OTPInput = ({ length = 6, onComplete, disabled = false }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return

    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Move to next input if current is filled
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1].focus()
    }

    // Call onComplete when all digits are filled
    const otpString = newOtp.join('')
    if (otpString.length === length) {
      onComplete(otpString)
    }
  }

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }

    // Move to next on arrow right
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus()
    }

    // Move to previous on arrow left
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length)
    
    if (!/^\d+$/.test(pastedData)) return // Only allow numbers

    const newOtp = pastedData.split('')
    setOtp([...newOtp, ...new Array(length - newOtp.length).fill('')])

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length, length) - 1
    if (inputRefs.current[lastFilledIndex]) {
      inputRefs.current[lastFilledIndex].focus()
    }

    // Call onComplete if pasted code is complete
    if (pastedData.length === length) {
      onComplete(pastedData)
    }
  }

  const handleFocus = (e) => {
    e.target.select()
  }

  return (
    <div className="otp-input-container">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          disabled={disabled}
          className={`otp-input ${digit ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
        />
      ))}
    </div>
  )
}

export default OTPInput
