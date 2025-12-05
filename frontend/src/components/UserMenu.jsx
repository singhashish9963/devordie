import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import ConfigManager from './ConfigManager'
import '../styles/Auth.css'

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showConfigManager, setShowConfigManager] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
  }

  if (!isAuthenticated) {
    return (
      <>
        <button
          className="login-btn"
          onClick={() => setShowAuthModal(true)}
        >
          Login / Sign Up
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    )
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className="user-menu" ref={dropdownRef}>
        <button
          className="user-menu-btn"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="user-avatar">{getInitials(user.name)}</div>
          <span>{user.name}</span>
          <span className="dropdown-arrow">▼</span>
        </button>

        {showDropdown && (
          <div className="user-dropdown">
            <div className="user-info">
              <div className="user-info-name">{user.name}</div>
              <div className="user-info-email">{user.email}</div>
            </div>
            <button onClick={() => {
              setShowConfigManager(true)
              setShowDropdown(false)
            }}>
              💾 Saved Configurations
            </button>
            <button onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {showConfigManager && (
        <ConfigManager onClose={() => setShowConfigManager(false)} />
      )}
    </>
  )
}

export default UserMenu
