import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Generate secure 6-digit OTP
export const generateOTP = () => {
  // Use crypto for cryptographically secure random numbers
  const otp = crypto.randomInt(100000, 999999).toString()
  return otp
}

// Hash OTP for secure storage
export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(otp, salt)
}

// Verify OTP
export const verifyOTP = async (providedOTP, hashedOTP) => {
  return bcrypt.compare(providedOTP, hashedOTP)
}

// Check if OTP is expired
export const isOTPExpired = (expiryDate) => {
  if (!expiryDate) return true
  return Date.now() > expiryDate.getTime()
}

// Generate OTP with expiry
export const generateOTPWithExpiry = async (expiryMinutes = 10) => {
  const otp = generateOTP()
  const hashedOTP = await hashOTP(otp)
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)
  
  return {
    otp, // Plain OTP to send via email
    hashedOTP, // Hashed OTP to store in database
    expiresAt
  }
}

// Validate OTP attempt
export const validateOTPAttempt = (user, providedOTP) => {
  // Check if account is locked
  if (user.isLocked && user.isLocked()) {
    const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000)
    return {
      valid: false,
      error: `Account temporarily locked. Try again in ${unlockTime} minutes.`
    }
  }

  // Check if OTP exists
  if (!user.emailVerificationToken && !user.passwordResetToken) {
    return {
      valid: false,
      error: 'No verification code found. Please request a new one.'
    }
  }

  // Check if OTP is expired
  const expiryField = user.emailVerificationExpires || user.passwordResetExpires
  if (isOTPExpired(expiryField)) {
    return {
      valid: false,
      error: 'Verification code has expired. Please request a new one.',
      expired: true
    }
  }

  // Check OTP format
  if (!providedOTP || !/^\d{6}$/.test(providedOTP)) {
    return {
      valid: false,
      error: 'Invalid code format. Please enter a 6-digit code.'
    }
  }

  return { valid: true }
}

// Clear OTP data after successful verification
export const clearOTPData = (user, type = 'verification') => {
  if (type === 'verification') {
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    user.isEmailVerified = true
  } else if (type === 'passwordReset') {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
  }
  
  user.otpAttempts = 0
  user.lastOTPSent = undefined
  user.accountLocked = false
  user.lockUntil = undefined
}

// Generate secure token for magic links (future enhancement)
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex')
}
