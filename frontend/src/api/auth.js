const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Auth API
export const authAPI = {
  async signup(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    })
    return response.json()
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },

  async verifyEmail(email, otp) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, otp })
    })
    return response.json()
  },

  async resendOTP(email) {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    })
    return response.json()
  },

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return response.json()
  },

  async verifyResetOTP(email, otp) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    })
    return response.json()
  },

  async resetPassword(email, otp, newPassword) {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    })
    return response.json()
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    return response.json()
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include'
    })
    return response.json()
  },

  async updateProfile(name) {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    })
    return response.json()
  }
}

// Configuration API
export const configurationAPI = {
  async save(name, description, config, isPublic = false, tags = []) {
    const response = await fetch(`${API_BASE_URL}/api/configurations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description, config, isPublic, tags })
    })
    return response.json()
  },

  async getAll() {
    const response = await fetch(`${API_BASE_URL}/api/configurations`, {
      credentials: 'include'
    })
    return response.json()
  },

  async getPublic(tags = null, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit })
    if (tags) params.append('tags', tags)
    
    const response = await fetch(`${API_BASE_URL}/api/configurations/public?${params}`, {
      credentials: 'include'
    })
    return response.json()
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/api/configurations/${id}`, {
      credentials: 'include'
    })
    return response.json()
  },

  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/configurations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    return response.json()
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/api/configurations/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    return response.json()
  },

  async updateStats(id, result) {
    const response = await fetch(`${API_BASE_URL}/api/configurations/${id}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ result })
    })
    return response.json()
  }
}
