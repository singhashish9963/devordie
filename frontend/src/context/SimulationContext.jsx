import React, { createContext, useContext, useState } from 'react'

const SimulationContext = createContext()

export const useSimulationContext = () => {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error('useSimulationContext must be used within SimulationProvider')
  }
  return context
}

export const SimulationProvider = ({ children }) => {
  const [state, setState] = useState({
    units: [],
    grid: null,
    isSimulating: false
  })

  const value = {
    state,
    setState
  }

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
