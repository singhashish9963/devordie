import express from 'express'
import { body, validationResult } from 'express-validator'
import rateLimit from 'express-rate-limit'
import User from '../models/User.js'
import { generateToken, authMiddleware } from '../middleware/auth.js'
import { sendVerificationEmail, sendPasswordResetEmail, canSendOTP } from '../services/emailService.js'
import { generateOTPWithExpiry, verifyOTP, validateOTPAttempt, clearOTPData } from '../services/otpService.js'

const router = express.Router()

// Rate limiters
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 signups per IP
  message: 'Too many accounts created from this IP, please try again later'
})

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 OTP requests per IP
  message: 'Too many OTP requests, please try again later'
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later'
})

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// @route   POST /api/auth/signup
// @desc    Register a new user and send OTP
// @access  Public
router.post('/signup', signupLimiter, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      // If user exists but not verified, resend OTP
      if (!existingUser.isEmailVerified) {
        // Check rate limit
        const rateLimitCheck = canSendOTP(existingUser)
        if (!rateLimitCheck.canSend) {
          return res.status(429).json({
            success: false,
            message: rateLimitCheck.message
          })
        }

        // Generate new OTP
        const { otp, hashedOTP, expiresAt } = await generateOTPWithExpiry()
        existingUser.emailVerificationToken = hashedOTP
        existingUser.emailVerificationExpires = expiresAt
        existingUser.lastOTPSent = new Date()
        await existingUser.save()

        // Send email
        try {
          await sendVerificationEmail(email, name, otp)
        } catch (emailError) {
          console.error('Email send error:', emailError)
          return res.status(500).json({
            success: false,
            message: 'Failed to send verification email. Please try again.'
          })
        }

        return res.status(200).json({
          success: true,
          message: 'Verification code resent to your email',
          userId: existingUser._id,
          email: existingUser.email,
          requiresVerification: true
        })
      }

      return res.status(400).json({
        success: false,
        message: 'Email already registered and verified. Please login.'
      })
    }

    // Create new user (unverified)
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: false
    })

    // Generate OTP
    const { otp, hashedOTP, expiresAt } = await generateOTPWithExpiry()
    user.emailVerificationToken = hashedOTP
    user.emailVerificationExpires = expiresAt
    user.lastOTPSent = new Date()
    await user.save()

    // Send verification email
    try {
      await sendVerificationEmail(email, name, otp)
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Delete user if email fails
      await User.findByIdAndDelete(user._id)
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      })
    }

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email for verification code.',
      userId: user._id,
      email: user.email,
      requiresVerification: true
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    })
  }
})

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
router.post('/verify-email', otpLimiter, [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], validateRequest, async (req, res) => {
  try {
    const { email, otp } = req.body

    // Find user with verification fields
    const user = await User.findOne({ email })
      .select('+emailVerificationToken +emailVerificationExpires +otpAttempts +lastOTPSent +lockUntil')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      })
    }

    // Validate OTP attempt
    const validation = validateOTPAttempt(user, otp)
    if (!validation.valid) {
      if (!validation.expired) {
        await user.incrementOTPAttempts()
      }
      return res.status(400).json({
        success: false,
        message: validation.error
      })
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, user.emailVerificationToken)
    if (!isValid) {
      await user.incrementOTPAttempts()
      
      const remainingAttempts = 5 - (user.otpAttempts + 1)
      return res.status(400).json({
        success: false,
        message: remainingAttempts > 0 
          ? `Invalid code. ${remainingAttempts} attempts remaining.`
          : 'Too many failed attempts. Please request a new code.'
      })
    }

    // Clear OTP data and mark as verified
    clearOTPData(user, 'verification')
    await user.resetOTPAttempts()
    await user.save()

    // Generate JWT token
    const token = generateToken(user._id)

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: true
      },
      token
    })
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    })
  }
})

// @route   POST /api/auth/resend-otp
// @desc    Resend verification OTP
// @access  Public
router.post('/resend-otp', otpLimiter, [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], validateRequest, async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
      .select('+lastOTPSent +otpAttempts +lockUntil')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      })
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000)
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked. Try again in ${unlockTime} minutes.`
      })
    }

    // Check rate limit
    const rateLimitCheck = canSendOTP(user)
    if (!rateLimitCheck.canSend) {
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.message,
        waitTime: rateLimitCheck.waitTime
      })
    }

    // Generate new OTP
    const { otp, hashedOTP, expiresAt } = await generateOTPWithExpiry()
    user.emailVerificationToken = hashedOTP
    user.emailVerificationExpires = expiresAt
    user.lastOTPSent = new Date()
    user.otpAttempts = 0 // Reset attempts on new OTP
    await user.save()

    // Send email
    try {
      await sendVerificationEmail(email, user.name, otp)
    } catch (emailError) {
      console.error('Email send error:', emailError)
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again.'
      })
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to resend code'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user with password field
    const user = await User.findOne({ email })
      .select('+password +emailVerificationToken +emailVerificationExpires +lastOTPSent +lockUntil')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Check rate limit before sending new OTP
      const rateLimitCheck = canSendOTP(user)
      
      if (rateLimitCheck.canSend) {
        // Generate and send new OTP
        const { otp, hashedOTP, expiresAt } = await generateOTPWithExpiry()
        user.emailVerificationToken = hashedOTP
        user.emailVerificationExpires = expiresAt
        user.lastOTPSent = new Date()
        await user.save()

        try {
          await sendVerificationEmail(email, user.name, otp)
        } catch (emailError) {
          console.error('Email send error:', emailError)
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please check your email for verification code.',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, (req, res) => {
  res.clearCookie('token')
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
], validateRequest, async (req, res) => {
  try {
    const { name } = req.body
    
    const user = await User.findById(req.user._id)
    if (name) user.name = name
    
    await user.save()

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
// @access  Public
router.post('/forgot-password', otpLimiter, [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], validateRequest, async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
      .select('+lastOTPSent +lockUntil')

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.'
      })
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000)
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Try again in ${unlockTime} minutes.`
      })
    }

    // Check rate limit
    const rateLimitCheck = canSendOTP(user)
    if (!rateLimitCheck.canSend) {
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.message,
        waitTime: rateLimitCheck.waitTime
      })
    }

    // Generate password reset OTP
    const { otp, hashedOTP, expiresAt } = await generateOTPWithExpiry()
    user.passwordResetToken = hashedOTP
    user.passwordResetExpires = expiresAt
    user.lastOTPSent = new Date()
    user.otpAttempts = 0
    await user.save()

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.name, otp)
    } catch (emailError) {
      console.error('Email send error:', emailError)
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset code. Please try again.'
      })
    }

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      email: user.email
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    })
  }
})

// @route   POST /api/auth/verify-reset-otp
// @desc    Verify password reset OTP
// @access  Public
router.post('/verify-reset-otp', otpLimiter, [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], validateRequest, async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
      .select('+passwordResetToken +passwordResetExpires +otpAttempts +lockUntil')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Validate OTP attempt
    const validation = validateOTPAttempt(user, otp)
    if (!validation.valid) {
      if (!validation.expired) {
        await user.incrementOTPAttempts()
      }
      return res.status(400).json({
        success: false,
        message: validation.error
      })
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, user.passwordResetToken)
    if (!isValid) {
      await user.incrementOTPAttempts()
      
      const remainingAttempts = 5 - (user.otpAttempts + 1)
      return res.status(400).json({
        success: false,
        message: remainingAttempts > 0 
          ? `Invalid code. ${remainingAttempts} attempts remaining.`
          : 'Too many failed attempts. Please request a new code.'
      })
    }

    // OTP is valid - don't clear yet, will clear on password reset
    await user.resetOTPAttempts()
    await user.save()

    res.json({
      success: true,
      message: 'Code verified. You can now reset your password.',
      verified: true
    })
  } catch (error) {
    console.error('Verify reset OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password with verified OTP
// @access  Public
router.post('/reset-password', [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    const user = await User.findOne({ email })
      .select('+passwordResetToken +passwordResetExpires +password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Validate OTP one more time
    const validation = validateOTPAttempt(user, otp)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      })
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, user.passwordResetToken)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code'
      })
    }

    // Update password
    user.password = newPassword
    
    // Clear password reset data
    clearOTPData(user, 'passwordReset')
    await user.save()

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    })
  }
})

export default router
