import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  // Password reset fields
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  // Security fields
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lastOTPSent: {
    type: Date,
    select: false
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Method to get user data without sensitive info
userSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  delete user.__v
  delete user.emailVerificationToken
  delete user.emailVerificationExpires
  delete user.passwordResetToken
  delete user.passwordResetExpires
  delete user.otpAttempts
  delete user.lastOTPSent
  delete user.lockUntil
  return user
}

// Check if account is locked
userSchema.methods.isLocked = function() {
  return this.accountLocked && this.lockUntil && this.lockUntil > Date.now()
}

// Increment OTP attempts and lock if needed
userSchema.methods.incrementOTPAttempts = async function() {
  // Reset attempts if last attempt was over 15 minutes ago
  if (this.lastOTPSent && Date.now() - this.lastOTPSent > 15 * 60 * 1000) {
    this.otpAttempts = 0
  }
  
  this.otpAttempts += 1
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.otpAttempts >= 5) {
    this.accountLocked = true
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  }
  
  await this.save()
}

// Reset OTP attempts on successful verification
userSchema.methods.resetOTPAttempts = async function() {
  this.otpAttempts = 0
  this.accountLocked = false
  this.lockUntil = undefined
  await this.save()
}

export default mongoose.model('User', userSchema)
