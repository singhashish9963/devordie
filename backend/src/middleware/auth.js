import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'devordie-secret-key-change-in-production'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  })
}

// Verify JWT token middleware
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.token
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.'
      })
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      })
    }

    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET)
      const user = await User.findById(decoded.userId).select('-password')
      if (user) {
        req.user = user
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next()
}
