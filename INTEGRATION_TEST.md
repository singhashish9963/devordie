# Frontend-Backend Integration Test Guide

## ✅ What Was Done

### Backend Integration
1. **API Client Created** (`frontend/src/api/index.js`)
   - Full HTTP client for backend communication
   - Methods: create, start, step, getState, delete, validate, getAll
   - Health check for connection monitoring
   - API Base URL: `http://localhost:5000/api`

2. **useSimulation Hook Updated** (`frontend/src/hooks/useSimulation.js`)
   - Replaced MockSimulationEngine with real backend API calls
   - Added simulationId tracking for backend state management
   - All simulation control methods now async with backend communication:
     - `initializeSimulation()` - Creates simulation on backend
     - `startSimulation()` - Runs full simulation on backend
     - `stepSimulation()` - Executes single tick on backend
     - `stopSimulation()` - Deletes simulation from backend

3. **UI Enhancements** (`frontend/src/components/SimulationControls.jsx`)
   - Backend connection status indicator with live health checks
   - Real-time team alive counts (Team A vs Team B)
   - Enhanced statistics display with proper styling
   - Disabled controls when backend is disconnected
   - Winner announcement with visual effects

## 🧪 Testing Steps

### 1. Verify Both Servers Are Running

**Backend** (Terminal 1):
```bash
cd backend
npm start
```
Expected: Server running on `http://localhost:5000`

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Expected: Server running on `http://localhost:3004`

### 2. Check Backend Connection

1. Open browser to `http://localhost:3004`
2. Look for backend status indicator in top right
3. Should show **green "Backend"** status (connected)
4. If red/offline, verify backend server is running

### 3. Test Training Mode Simulation

1. Click **"Training Mode"** from home
2. Configure both teams in Code Editor:
   - Team A: Add units with AI code
   - Team B: Add units with AI code
3. Click **"Initialize Simulation"**
   - Should see "Backend: Connected" indicator
   - Units should appear on battlefield grid
4. Click **"▶ Start"** button
   - Backend processes full simulation
   - Results return and display on grid
   - Statistics update with real counts
5. Check statistics panel:
   - Tick count updates
   - Team A alive count (green)
   - Team B alive count (red)
   - Winner announcement if finished

### 4. Test Step Mode

1. Initialize a new simulation
2. Click **"⏭ Step"** button repeatedly
3. Each click should:
   - Send request to backend
   - Execute single tick
   - Return updated state
   - Refresh grid visualization
   - Update statistics

### 5. Test Stop/Reset

1. During a simulation, click **"⏹ Stop"**
   - Backend deletes simulation
   - Frontend clears state
   - Returns to ready state
2. Click **"🔄 Reset"**
   - Clears editor
   - Ready for new simulation

### 6. Verify Backend Communication

**Check Browser DevTools:**
1. Open DevTools (F12) → Network tab
2. Run a simulation
3. Should see API requests:
   - `POST /api/simulations` - Create simulation
   - `POST /api/simulations/:id/start` - Start full run
   - `POST /api/simulations/:id/step` - Single tick
   - `DELETE /api/simulations/:id` - Stop

**Check Backend Logs:**
- Terminal should show request logs
- Example:
  ```
  [2024-01-15 10:30:15] POST /api/simulations - 201
  [2024-01-15 10:30:16] POST /api/simulations/abc123/start - 200
  ```

## 🎯 Expected Behaviors

### ✅ Success Indicators
- Green "Backend" status indicator visible
- Units render on grid after initialization
- Start button triggers full simulation run
- Statistics show real team counts
- Step button advances one tick at a time
- Battle logs show combat events
- Winner displays when simulation ends
- All controls responsive and functional

### ❌ Common Issues

**Backend Status Shows "Offline"**
- Solution: Ensure backend server is running on port 5000
- Check: `curl http://localhost:5000/health`

**Buttons Disabled**
- Solution: Backend must be connected (green status)
- Check backend console for errors

**No Units on Grid**
- Solution: Click "Initialize Simulation" first
- Verify both teams have units configured

**Statistics Not Updating**
- Check browser console for API errors
- Verify backend is processing requests (check backend logs)

**CORS Errors**
- Backend already configured to allow frontend origin
- If issues persist, check backend `.env` CORS_ORIGIN setting

## 📊 Real vs Mock Comparison

### Previous (Mock Engine)
- All simulation ran in frontend JavaScript
- Instant, synchronous execution
- No network communication
- Limited to frontend CPU

### Current (Real Backend)
- Simulation runs on backend server
- Async HTTP API communication
- Scalable to powerful backend hardware
- Ready for C++ WASM engine upgrade
- Network latency minimal on localhost

## 🚀 Next Steps (Optional)

1. **Compile C++ WASM Engine**
   ```bash
   cd engine
   ./build-wasm.bat
   ```
   - Provides 10-100x performance boost
   - Can run simulations with thousands of units

2. **Deploy to Production**
   - Backend: Deploy to cloud server
   - Frontend: Update API_BASE_URL to production URL
   - Build frontend: `npm run build`

3. **Add More Features**
   - Real-time simulation streaming (WebSockets)
   - Replay functionality
   - Statistics charts and graphs
   - Save/load simulation configurations

## 📝 Architecture Overview

```
Frontend (React)                      Backend (Node.js)
┌─────────────────┐                  ┌──────────────────┐
│ SimulationUI    │◄────HTTP────────►│ Express Server   │
│  - Controls     │    /api/         │  - REST API      │
│  - Grid Display │   simulations    │  - Engine        │
│  - Statistics   │                  │  - Validation    │
└─────────────────┘                  └──────────────────┘
         ▲                                     ▲
         │                                     │
         │                                     │
    useSimulation                        SimulationEngine
         Hook                            (JavaScript)
         │                                     │
         │                                     │
    SimulationAPI                         (Future: WASM)
      Client                               C++ Engine
```

## ✅ Integration Complete!

Your frontend is now fully integrated with the backend. The simulation runs on the server with real battle logic, and the frontend displays the results in real-time. All mock code has been replaced with actual API communication.

**Test it now at: http://localhost:3004**
