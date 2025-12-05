import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSimulationContext } from '../context/SimulationContext'
import { configurationAPI } from '../api/auth'
import '../styles/ConfigManager.css'

const ConfigManager = ({ onClose }) => {
  const { isAuthenticated } = useAuth()
  const { editorState, setEditorState, setCodeEditors } = useSimulationContext()
  const [mode, setMode] = useState('load') // 'save' or 'load'
  const [configurations, setConfigurations] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Form state for saving
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    isPublic: false,
    tags: ''
  })

  useEffect(() => {
    if (mode === 'load') {
      loadConfigurations()
    }
  }, [mode])

  const loadConfigurations = async () => {
    setLoading(true)
    try {
      const response = await configurationAPI.getAll()
      if (response.success) {
        setConfigurations(response.configs)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load configurations' })
    }
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const config = {
      gridSize: editorState.gridSize,
      terrain: editorState.terrain,
      units: editorState.units,
      code: editorState.code
    }

    const tags = saveForm.tags.split(',').map(t => t.trim()).filter(Boolean)

    try {
      const response = await configurationAPI.save(
        saveForm.name,
        saveForm.description,
        config,
        saveForm.isPublic,
        tags
      )

      if (response.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' })
        setSaveForm({ name: '', description: '', isPublic: false, tags: '' })
        setTimeout(() => onClose(), 2000)
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to save' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' })
    }
    setLoading(false)
  }

  const handleLoad = async (configId) => {
    setLoading(true)
    setMessage(null)
    
    try {
      const response = await configurationAPI.getById(configId)
      if (response.success) {
        const { config } = response.config
        
        // Load terrain
        if (config.terrain) {
          setEditorState(prev => ({
            ...prev,
            terrain: config.terrain
          }))
        }

        // Load units
        if (config.units) {
          setEditorState(prev => ({
            ...prev,
            units: config.units
          }))
        }

        // Load code
        if (config.code) {
          setCodeEditors(config.code)
        }

        setMessage({ type: 'success', text: 'Configuration loaded successfully!' })
        setTimeout(() => onClose(), 1500)
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to load configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load configuration' })
    }
    setLoading(false)
  }

  const handleDelete = async (configId) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return

    setLoading(true)
    try {
      const response = await configurationAPI.delete(configId)
      if (response.success) {
        setMessage({ type: 'success', text: 'Configuration deleted' })
        loadConfigurations()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete configuration' })
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="config-modal-overlay" onClick={onClose}>
        <div className="config-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
          <div className="config-manager">
            <h2>Authentication Required</h2>
            <p>Please log in to save and load configurations.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="config-modal-overlay" onClick={onClose}>
      <div className="config-modal large" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✕</button>
        
        <div className="config-manager">
          <div className="config-header">
            <h2>Configuration Manager</h2>
            <div className="mode-switcher">
              <button
                className={mode === 'save' ? 'active' : ''}
                onClick={() => setMode('save')}
              >
                💾 Save
              </button>
              <button
                className={mode === 'load' ? 'active' : ''}
                onClick={() => setMode('load')}
              >
                📂 Load
              </button>
            </div>
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {mode === 'save' ? (
            <form onSubmit={handleSave} className="save-form">
              <div className="form-group">
                <label>Configuration Name *</label>
                <input
                  type="text"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="My Battle Strategy"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your strategy..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="aggressive, defensive, tank-heavy"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={saveForm.isPublic}
                    onChange={(e) => setSaveForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  Make public (visible to others)
                </label>
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </form>
          ) : (
            <div className="load-section">
              {loading ? (
                <p className="loading">Loading configurations...</p>
              ) : configurations.length === 0 ? (
                <p className="empty">No saved configurations yet</p>
              ) : (
                <div className="config-list">
                  {configurations.map(config => (
                    <div key={config._id} className="config-item">
                      <div className="config-info">
                        <h3>{config.name}</h3>
                        {config.description && <p>{config.description}</p>}
                        <div className="config-meta">
                          <span className="date">
                            {new Date(config.createdAt).toLocaleDateString()}
                          </span>
                          {config.tags && config.tags.length > 0 && (
                            <div className="tags">
                              {config.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          {config.isPublic && <span className="public-badge">Public</span>}
                        </div>
                      </div>
                      <div className="config-actions">
                        <button
                          className="load-btn"
                          onClick={() => handleLoad(config._id)}
                          disabled={loading}
                        >
                          Load
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(config._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigManager
