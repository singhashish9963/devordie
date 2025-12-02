import { useState, useCallback } from 'react'

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [simulationData, setSimulationData] = useState(null)

  const startSimulation = useCallback(() => {
    setIsRunning(true)
    // Add simulation logic here
  }, [])

  const stopSimulation = useCallback(() => {
    setIsRunning(false)
  }, [])

  return {
    isRunning,
    simulationData,
    startSimulation,
    stopSimulation
  }
}
