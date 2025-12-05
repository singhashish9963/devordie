import { useState, useCallback, useRef, useEffect } from 'react'
import { useSimulationContext } from '../context/SimulationContext'
import { simulationAPI } from '../api'
import { SIMULATION_STATUS, GRID_SIZE } from '../utils/constants'

export const useSimulation = () => {
  const { editorState, simulationState, setSimulationState } = useSimulationContext()
  const simulationIdRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Initialize simulation with backend
  const initializeSimulation = useCallback(async () => {
    try {
      // Validate units exist
      if (!editorState.units.teamA || editorState.units.teamA.length === 0) {
        setSimulationState(prev => ({
          ...prev,
          logs: [...prev.logs, 'Error: Team A has no units. Add units first!']
        }))
        return { success: false, error: 'Team A has no units' }
      }
      
      if (!editorState.units.teamB || editorState.units.teamB.length === 0) {
        setSimulationState(prev => ({
          ...prev,
          logs: [...prev.logs, 'Error: Team B has no units. Add units first!']
        }))
        return { success: false, error: 'Team B has no units' }
      }

      // Prepare configuration for backend
      const config = {
        gridSize: {
          width: GRID_SIZE.WIDTH,
          height: GRID_SIZE.HEIGHT
        },
        terrain: editorState.terrain,
        units: {
          teamA: editorState.units.teamA || [],
          teamB: editorState.units.teamB || []
        },
        code: {
          teamA: editorState.code.teamA || '',
          teamB: editorState.code.teamB || ''
        },
        maxTicks: 1000
      }
      
      // Create simulation on backend
      const response = await simulationAPI.create(config)
      
      if (response.success) {
        simulationIdRef.current = response.simulationId
        setSimulationState({
          status: SIMULATION_STATUS.IDLE,
          tick: 0,
          units: [],
          logs: ['Simulation initialized with backend'],
          winner: null
        })
        return { success: true }
      } else {
        setSimulationState(prev => ({
          ...prev,
          logs: [...prev.logs, `Error: ${response.error}`]
        }))
        return { success: false, error: response.error }
      }
    } catch (error) {
      setSimulationState(prev => ({
        ...prev,
        logs: [...prev.logs, `Connection error: ${error.message}`]
      }))
      return { success: false, error: error.message }
    }
  }, [editorState, setSimulationState])

  // Start simulation (auto-step mode for visualization)
  const startSimulation = useCallback(async () => {
    // Always create a fresh simulation
    simulationIdRef.current = null
    
    const initResult = await initializeSimulation()
    if (!initResult.success) return

    setSimulationState(prev => ({
      ...prev,
      status: SIMULATION_STATUS.RUNNING,
      logs: [...prev.logs, 'Starting animated simulation...']
    }))

    // Auto-step function
    const autoStep = async () => {
      try {
        const response = await simulationAPI.step(simulationIdRef.current)
        
        if (response.success) {
          const isFinished = response.state.status === 'finished' || response.state.winner
          
          setSimulationState({
            status: isFinished ? SIMULATION_STATUS.FINISHED : SIMULATION_STATUS.RUNNING,
            tick: response.state.tick,
            units: response.state.units,
            logs: response.state.logs,
            winner: response.state.winner
          })

          // Continue stepping if not finished
          if (!isFinished) {
            animationFrameRef.current = setTimeout(autoStep, 100) // 100ms between ticks
          }
        } else {
          setSimulationState(prev => ({
            ...prev,
            status: SIMULATION_STATUS.IDLE,
            logs: [...prev.logs, `Error: ${response.error}`]
          }))
        }
      } catch (error) {
        setSimulationState(prev => ({
          ...prev,
          status: SIMULATION_STATUS.IDLE,
          logs: [...prev.logs, `Connection error: ${error.message}`]
        }))
      }
    }

    // Start auto-stepping
    autoStep()
  }, [initializeSimulation, setSimulationState])

  // Pause simulation
  const pauseSimulation = useCallback(() => {
    if (animationFrameRef.current) {
      clearTimeout(animationFrameRef.current)
    }
    setSimulationState(prev => ({
      ...prev,
      status: SIMULATION_STATUS.PAUSED
    }))
  }, [setSimulationState])

  // Resume simulation
  const resumeSimulation = useCallback(() => {
    startSimulation()
  }, [startSimulation])

  // Stop and reset simulation
  const stopSimulation = useCallback(async () => {
    if (animationFrameRef.current) {
      clearTimeout(animationFrameRef.current)
    }
    
    // Delete simulation on backend
    if (simulationIdRef.current) {
      try {
        await simulationAPI.delete(simulationIdRef.current)
      } catch (error) {
        console.error('Error deleting simulation:', error)
      }
      simulationIdRef.current = null
    }
    
    setSimulationState({
      status: SIMULATION_STATUS.IDLE,
      tick: 0,
      units: [],
      logs: [],
      winner: null
    })
  }, [setSimulationState])

  // Step simulation (execute one tick)
  const stepSimulation = useCallback(async () => {
    if (!simulationIdRef.current) {
      await initializeSimulation()
    }

    try {
      const response = await simulationAPI.step(simulationIdRef.current)
      
      if (response.success) {
        setSimulationState({
          status: response.state.status === 'finished' ? SIMULATION_STATUS.FINISHED : SIMULATION_STATUS.PAUSED,
          tick: response.state.tick,
          units: response.state.units,
          logs: response.state.logs,
          winner: response.state.winner
        })
      } else {
        setSimulationState(prev => ({
          ...prev,
          logs: [...prev.logs, `Error: ${response.error}`]
        }))
      }
    } catch (error) {
      setSimulationState(prev => ({
        ...prev,
        logs: [...prev.logs, `Connection error: ${error.message}`]
      }))
    }
  }, [initializeSimulation, setSimulationState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current)
      }
    }
  }, [])

  return {
    simulationState,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    stepSimulation,
    initializeSimulation
  }
}
