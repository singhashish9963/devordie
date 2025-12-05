import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getCurrentUser()
      if (response.success) {
        setUser(response.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    try {
      setError(null)
      const response = await authAPI.signup(name, email, password)
      
      if (response.success) {
        setUser(response.user)
        return { success: true }
      } else {
        setError(response.message || 'Signup failed')
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = 'Signup failed. Please try again.'
      setError(message)
      return { success: false, message }
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authAPI.login(email, password)
      
      if (response.success) {
        setUser(response.user)
        return { success: true }
      } else {
        setError(response.message || 'Login failed')
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = 'Login failed. Please try again.'
      setError(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const updateProfile = async (name) => {
    try {
      setError(null)
      const response = await authAPI.updateProfile(name)
      
      if (response.success) {
        setUser(response.user)
        return { success: true }
      } else {
        setError(response.message || 'Update failed')
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = 'Update failed. Please try again.'
      setError(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    updateProfile,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
