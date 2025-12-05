const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// Simulation API
export const simulationAPI = {
  // Create new simulation
  async create(config) {
    const response = await fetch(`${API_BASE_URL}/simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return response.json()
  },

  // Start simulation (run to completion)
  async start(simulationId) {
    const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}/start`, {
      method: 'POST'
    })
    return response.json()
  },

  // Step simulation (single tick)
  async step(simulationId) {
    const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}/step`, {
      method: 'POST'
    })
    return response.json()
  },

  // Get simulation state
  async getState(simulationId) {
    const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`)
    return response.json()
  },

  // Delete simulation
  async delete(simulationId) {
    const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`, {
      method: 'DELETE'
    })
    return response.json()
  },

  // Validate configuration
  async validate(config) {
    const response = await fetch(`${API_BASE_URL}/simulations/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return response.json()
  },

  // Get all simulations
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/simulations`)
    return response.json()
  }
}

// Configuration API
export const configAPI = {
  // Save configuration
  async save(config) {
    const response = await fetch(`${API_BASE_URL}/configs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return response.json()
  },

  // Get all configurations
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/configs`)
    return response.json()
  },

  // Get configuration by ID
  async getById(configId) {
    const response = await fetch(`${API_BASE_URL}/configs/${configId}`)
    return response.json()
  }
}

// Health check
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
    return response.json()
  } catch (error) {
    return { status: 'error', error: error.message }
  }
}
