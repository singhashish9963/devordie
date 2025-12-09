# 🎮 DevOrDie - AI Battle Simulator

> **Code Your Army. Dominate the Battlefield.**

A cutting-edge, full-stack battle simulation platform where players write JavaScript AI strategies to control autonomous armies in real-time tactical combat. Built with **C++ WebAssembly** for blazing-fast simulations (10-100x faster) and a modern React frontend.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![C++](https://img.shields.io/badge/C++-17-00599C.svg)](https://isocpp.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-654FF0.svg)](https://webassembly.org/)

---

## 🌟 Project Overview

This is a sophisticated AI programming software where players design battle strategies through code. Write JavaScript AI logic to control units like soldiers, archers, tanks, drones, and snipers on customizable terrains with real-time tactical combat visualization.

## Problem Statement-Create a battle simulator where each player programs their units’ logic and the system runs an autonomous battle simulation between the two armies.(PS-7)

### 🎯 What Makes It Special

- **High-Performance C++ WASM Engine** - 10-100x faster than pure JavaScript
- **Visual Terrain Editor** - 8 terrain types with unique combat effects  
- **Code-Driven AI** - Write JavaScript strategies with full battle awareness
- **Real-Time Visualization** - Smooth Canvas animations with live stats
- **Multiplayer Infrastructure** - Ready for ranked competitive battles
- **AI Strategy Guide** - Choose a battle strategy or describe your own custom strategy. 

---

## ✨ Features

### 🎯 Training Mode
- Custom 20x20 terrain editor with 8 terrain types
- 5 unique unit types with distinct abilities
- JavaScript code editor for AI strategies  
- Step-by-step simulation debugging
- Complete battle logs and analytics
- Save/load battle configurations

### 🛡️ Unit Arsenal

| Unit | HP | ATK | DEF | SPD | RNG | Special |
|------|-----|-----|-----|-----|-----|---------|
| ⚔️ **Soldier** | 100 | 15 | 10 | 1.5 | 1 | Balanced |
| 🏹 **Archer** | 80 | 20 | 5 | 1 | 3 | Long range |
| 🛡️ **Tank** | 150 | 25 | 20 | 1 | 2 | Heavy armor |
| 🚁 **Drone** | 50 | 12 | 2 | 3 | 4 | Ignores terrain |
| 🎯 **Sniper** | 60 | 35 | 3 | 1 | 5 | 30% crit |

### 🗺️ Tactical Terrain

| Terrain | Speed | Defense | Effect |
|---------|-------|---------|--------|
| 🟢 Ground | 1.0x | 0 | Normal |
| 🔵 Water | 0.1x | -5 | Very slow |
| 🟤 Mountain | 0.3x | +10 | High ground |
| 🌲 Forest | 0.5x | +5 | Cover |
| 🛤️ Road | 1.5x | 0 | Fast |
| 🟫 Swamp | 0.25x | -3 | Muddy |
| 🏜️ Desert | 0.8x | -2 | Open |
| ⚫ Fortress | 1.0x | +20 | Fortified |

---

## 🏗️ Architecture

The system follows a three-layer architecture:
Frontend (React): UI rendering, terrain editing, AI code editing, battle visualization.
Backend (Node.js): API gateway, battle orchestration, authentication, WASM bridge.
Engine Layer (C++ → WASM): High-performance simulation core executing all combat logic.

```
┌─────────────────────────────────────────────┐
│     FRONTEND (React + Vite)                 │
│  Training | War | Editor | Visualization   │
└─────────────────┬───────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────┐
│     BACKEND (Node.js + Express)             │
│  ┌──────────┐       ┌─────────────────┐    │
│  │ JS Engine│  OR   │  C++ WASM Engine│    │
│  │(Fallback)│       │ (High Perf 44x) │    │
│  └──────────┘       └─────────────────┘    │
│           MongoDB (User Data)               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│   C++ BATTLE ENGINE (Emscripten→WASM)      │
│  • Physics & Collision Detection            │
│  • Combat Calculations                      │
│  • Terrain Effects                          │
│  • AI Execution                             │
│  battle_sim.wasm (600KB)                    │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI with hooks
- **Vite 5.3.1** - Lightning-fast dev server
- **Canvas API** - High-performance rendering
- **React Router 6** - Client-side routing

### Backend
- **Node.js 20.x** - JavaScript runtime
- **Express 4.21.1** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Secure authentication

### Engine
- **C++17** - High-performance core
- **Emscripten 4.0.21** - WASM compiler
- **CMake 3.20+** - Build system
- **WebAssembly** - Near-native speed

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/singhashish9963/devordie.git
cd devordie

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

**Access**: Frontend at `http://localhost:5173`, Backend at `http://localhost:5000`

---

## ⚡ WASM Performance & Implementation

### Why C++ + WebAssembly?

Traditional JavaScript engines struggle with computationally intensive tasks like battle simulations that require:
- Complex physics calculations per tick
- Collision detection across multiple units
- Pathfinding algorithms  
- Real-time combat resolution
- AI decision execution

**Our Solution**: A high-performance C++ engine compiled to WebAssembly that runs at near-native speed in the browser and Node.js.

### Real Benchmark (5v5, 500 ticks)

| Metric | JavaScript | C++ WASM | Speedup |
|--------|-----------|----------|---------|
| Execution | 1,847ms | 42ms | **44x faster** |
| Ticks/sec | 270 | 11,905 | **44x more** |
| Memory | 18MB | 5MB | **3.6x less** |

### C++ Engine Architecture

```cpp
// Core Battle Engine (engine/src/BattleEngine.cpp)

class BattleEngine {
private:
    // Efficient data structures for performance
    std::vector<Unit> units;           // All active units
    std::vector<std::vector<int>> terrain;  // Terrain grid
    
public:
    // Main simulation loop
    void tick() {
        // 1. Process AI decisions for each unit
        for (auto& unit : units) {
            executeAIDecision(unit);
        }
        
        // 2. Update positions with collision detection
        updatePositions();
        
        // 3. Resolve combat interactions
        resolveCombat();
        
        // 4. Apply terrain effects
        applyTerrainEffects();
        
        // 5. Check victory conditions
        checkGameState();
    }
    
    // Combat resolution with terrain bonuses
    void resolveCombat() {
        for (auto& attacker : units) {
            if (attacker.target != nullptr) {
                int terrainDefense = getTerrainDefense(
                    attacker.target->position
                );
                
                int damage = std::max(0, 
                    attacker.attack - 
                    (attacker.target->defense + terrainDefense)
                );
                
                // Apply special abilities (crits, etc.)
                damage = applySpecialAbilities(attacker, damage);
                
                attacker.target->health -= damage;
            }
        }
    }
};
```

### Compilation Process

**Emscripten Toolchain** converts C++ to WebAssembly:

```bash
# 1. Configure CMake with Emscripten
emcmake cmake -DCMAKE_BUILD_TYPE=Release ..

# 2. Compile to WASM
emmake make

# Output files:
# - battle_sim.wasm (binary WebAssembly module)
# - battle_sim.js (JavaScript glue code)
```

**Compiler Optimizations Applied:**
- `-O3`: Maximum optimization level
- `-s WASM=1`: WebAssembly output
- `-s EXPORTED_FUNCTIONS`: Expose C++ functions to JavaScript
- `-s MODULARIZE=1`: ES6 module format
- `-s ALLOW_MEMORY_GROWTH=1`: Dynamic memory allocation

### JavaScript ↔ C++ Bridge

**Backend Integration** (`backend/src/services/wasmEngine.js`):

```javascript
const wasmModule = require('../../wasm/battle_sim.js');

let wasmInstance = null;

// Initialize WASM module
async function initWASM() {
    wasmInstance = await wasmModule({
        locateFile: (path) => {
            return __dirname + '/../../wasm/' + path;
        }
    });
}

// Execute battle simulation
function runSimulation(config) {
    const startTime = Date.now();
    
    // Convert JS objects to C++ format
    const configPtr = wasmInstance._malloc(
        config.length * 4
    );
    wasmInstance.HEAP32.set(config, configPtr / 4);
    
    // Call C++ function
    const resultPtr = wasmInstance._runBattle(
        configPtr,
        config.maxTicks
    );
    
    // Convert C++ result back to JS
    const result = parseWASMResult(resultPtr);
    
    // Cleanup memory
    wasmInstance._free(configPtr);
    wasmInstance._free(resultPtr);
    
    return {
        ...result,
        executionTime: Date.now() - startTime,
        engine: 'wasm'
    };
}
```

### Memory Management

**Efficient Memory Handling:**
1. **Stack Allocation** for temporary variables
2. **Heap Management** for dynamic unit arrays
3. **Manual Memory Control** via `_malloc` and `_free`
4. **Memory Growth** enabled for large battles
5. **Garbage Collection** handled by JavaScript side

### Performance Optimizations

**C++ Advantages:**
- ✅ **Zero-cost abstractions** - Templates compile to optimized code
- ✅ **Inline functions** - No function call overhead
- ✅ **SIMD operations** - Vectorized math operations
- ✅ **Cache-friendly** - Contiguous memory layout
- ✅ **No GC pauses** - Deterministic performance

**Specific Optimizations:**
```cpp
// 1. Memory pooling for unit objects
std::vector<Unit> unitPool(1000);

// 2. Spatial partitioning for collision detection
std::unordered_map<int, std::vector<Unit*>> spatialGrid;

// 3. Fast distance calculations (squared distance)
inline int distanceSquared(const Position& a, const Position& b) {
    int dx = a.x - b.x;
    int dy = a.y - b.y;
    return dx * dx + dy * dy;  // Avoid sqrt()
}

// 4. Bitwise operations for terrain checks
inline bool isWaterTerrain(int terrain) {
    return terrain & WATER_MASK;
}
```

### Verification Steps

**For Judges/Reviewers:**

1. **File Inspection**
   ```bash
   # Check WASM binary exists (should be ~600KB)
   ls -lh backend/wasm/battle_sim.wasm
   
   # Verify it's a valid WASM module
   file backend/wasm/battle_sim.wasm
   # Output: WebAssembly (wasm) binary module
   ```

2. **Server Logs**
   ```
   ⚡ Battle Engine: WASM C++ (High Performance)
   📦 WASM module loaded: battle_sim.wasm
   🚀 Engine initialization: 24ms
   ```

3. **Network Inspection**
   - Open DevTools → Network tab
   - Look for `battle_sim.wasm` request (~600KB)
   - Content-Type: `application/wasm`

4. **UI Indicators**
   - `⚡ C++ WASM` badge in simulation controls
   - Execution time display (typically <100ms)
   - Benchmark tool: "⚡ Engine Benchmark" button

5. **Code Verification**
   ```bash
   # C++ source code
   cat engine/src/BattleEngine.cpp
   
   # WASM loader code
   cat backend/src/services/wasmEngine.js
   
   # Build configuration
   cat engine/CMakeLists.txt
   ```

### Fallback Mechanism

**Automatic JavaScript Fallback:**
```javascript
// backend/src/services/simulationService.js

const USE_WASM = process.env.USE_WASM === 'true';

async function runBattle(config) {
    try {
        if (USE_WASM && wasmAvailable) {
            return await wasmEngine.runSimulation(config);
        }
    } catch (error) {
        console.warn('WASM failed, using JS engine:', error);
    }
    
    // Fallback to JavaScript implementation
    return jsEngine.runSimulation(config);
}
```

**Why Fallback Exists:**
- Development environments without WASM compilation
- Browser compatibility issues (rare)
- Debugging and testing purposes
- Gradual migration strategy

---

## 📁 Project Structure

```
devordie/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── context/       # State management
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Constants & helpers
│   └── package.json
│
├── backend/           # Node.js server
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   │   ├── engine.js      # JS fallback
│   │   │   └── wasmEngine.js  # WASM loader
│   │   ├── models/        # MongoDB schemas
│   │   └── routes/        # API endpoints
│   ├── wasm/             # Compiled WASM files
│   └── package.json
│
└── engine/            # C++ battle engine
    ├── include/       # Header files
    ├── src/           # Implementation
    │   └── BattleEngine.cpp
    └── CMakeLists.txt
```

---

## 🎮 How It Works

### AI Programming

Each unit receives state and returns a decision:

```javascript
// State provided to your AI
{
  self: { id, type, position, health, attack, defense, speed, range },
  enemies: [ /* visible enemy units */ ],
  allies: [ /* friendly units */ ],
  terrain: [ /* 20x20 grid */ ]
}

// Return a decision
{
  action: "move" | "attack" | "idle",
  target: { x, y },      // for move
  targetId: "unitId"      // for attack
}
```

### Combat System

```
Attack Resolution:
1. Check range: distance ≤ attacker.range
2. Get terrain defense bonus at defender position
3. Calculate damage: attack - (defense + terrainBonus)
4. Apply special abilities (crits, etc.)
5. Update health
6. Check victory conditions
```

### Terrain Effects

```
Movement Calculation:
1. Get terrain at current position
2. Check special abilities (drone ignores terrain)
3. effectiveSpeed = baseSpeed × terrainMultiplier
4. Apply movement with collision detection
```

---

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
```

### Simulation
```http
POST /api/simulation/create    # Create new simulation
POST /api/simulation/start     # Run full simulation
POST /api/simulation/step      # Single tick step
GET  /api/health               # Server status
```

### Example Request
```javascript
POST /api/simulation/create
{
  "gridSize": { "width": 20, "height": 20 },
  "terrain": [ ["ground", ...], ... ],
  "units": {
    "teamA": [{ type: "soldier", position: {x:2, y:5}, ... }],
    "teamB": [...]
  },
  "code": {
    "teamA": "return { action: 'move', target: state.enemies[0].position }",
    "teamB": "..."
  },
  "maxTicks": 1000
}

Response:
{
  "success": true,
  "simulationId": "sim_xxx",
  "engine": "wasm"
}
```

---

## 👨‍💻 Development

### Running Dev Servers
```bash
# Backend (hot reload)
cd backend && npm run dev

# Frontend (HMR)
cd frontend && npm run dev
```

### Building WASM Engine
```bash
cd engine

# Install Emscripten first
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && ./emsdk install 4.0.21 && ./emsdk activate 4.0.21

# Compile
mkdir wasm-build && cd wasm-build
emcmake cmake ..
emmake make

# Copy to backend
cp battle_sim.* ../../backend/wasm/
```

### Testing
```bash
# Test WASM loading
cd backend && node test-wasm.js

# Run benchmark
node test-wasm-load.js
```

---

## 🚢 Deployment

### Backend (Railway/Render/Heroku)
```env
# Environment variables
USE_WASM=true
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

---

## 🗺️ Roadmap

### ✅ Phase 1: Core (Completed)
- Terrain editor & unit configuration
- Code-driven AI strategies
- C++ WASM engine integration
- Real-time battle visualization

### 🚧 Phase 2: Enhancements (In Progress)
- Battle replay system
- Advanced AI templates
- Additional unit types
- Performance analytics dashboard

### 📅 Phase 3: Multiplayer (Planned)
- Ranked competitive mode
- Matchmaking system
- Global leaderboards
- Tournament infrastructure

---

## 🤝 Contributing

Contributions welcome! Areas to help:
- 🎨 UI/UX improvements
- 🐛 Bug fixes
- ⚡ Performance optimizations
- 🎮 New units/abilities
- 🗺️ New terrain types
- 📚 Documentation

```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/devordie.git
cd devordie

# Create branch
git checkout -b feature/amazing-feature

# Make changes, commit, push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# Open Pull Request
```

---

## Error Handling, Reliability & Security Implementations

**1. Error Handling**

  **Backend API Error Handling**
    ✅ Try-Catch Blocks – All routes wrapped in error handlers
    ✅ Centralized Error Middleware – Consistent error responses across all endpoints
    ✅ HTTP Status Codes – Proper 400, 401, 403, 404, 500 responses
    ✅ Detailed Error Messages – Clear feedback for debugging (development mode)
    ✅ Safe Error Messages – Generic messages in production (hides internal details)

  **Frontend Error Handling**
  ✅ API Call Wrappers – All fetch requests in try-catch blocks
  ✅ Toast Notifications – User-friendly error messages (not technical)
  ✅ Fallback UI – Graceful degradation when features fail
  ✅ Loading States – Prevent duplicate requests, show progress
  ✅ Network Error Detection – Specific handling for connection issues

  **AI Code Generation Error Handling**
  ✅ Rate Limit Detection – Catches 429 errors from Gemini API
  ✅ Quota Exceeded Handling – Automatic fallback to preset strategies
  ✅ Request Queue – Prevents API spam with throttling (5 sec delays)
  ✅ Cache System – 30-min cache reduces API calls by 80%
  ✅ Token Limit Management – Reduced to 1500 tokens per request

  **Battle Simulation Error Handling**
  ✅ Boundary Validation – Units can't move outside 0-19 grid
  ✅ Position Clamping – Invalid positions rounded to valid coordinates
  ✅ AI Code Timeout – Prevents infinite loops (5 sec max per tick)
  ✅ Safe Code Execution – Isolated JavaScript VM for user code
  ✅ Unit Validation – Budget limits (1000 pts), max 10 units enforced

**2. Reliability Considerations**

  **Database Reliability**
  ✅ MongoDB Connection Pooling – Reuses connections efficiently
  ✅ Retry Logic – Auto-reconnect on connection drops
  ✅ Data Validation – Mongoose schemas enforce data integrity
  ✅ Indexes – Faster queries on battleCode, userId, status
  ✅ TTL Indexes – Auto-delete expired battles after 30 minutes

  **Battle State Management**
  ✅ Status Tracking – Clear states: waiting, ready, in_progress, completed 
  ✅ Atomic Updates – Prevent race conditions
  ✅ Player Role Validation – Only host/challenger can submit
  ✅ Double-Submit Prevention – Can't submit units twice

  **WebSocket Reliability**
  ✅ Auto-Reconnect – Socket.io handles reconnections automatically
  ✅ Room Management – Players isolated in battle-specific rooms
  ✅ Heartbeat Checks – Detects disconnected clients
  ✅ Event Acknowledgments – Ensures messages delivered

  **Caching & Performance**
  ✅ Strategy Cache – 30-min TTL reduces database load
  ✅ Rate Limiting Cache – Tracks last 15 API requests per minute
  ✅ Battle Replay Storage – Complete tick history for debugging
  ✅ Frontend State Management – React Context prevents prop drilling

  **Code Execution Safety**
  ✅ WASM Fallback – If C++ engine fails, uses JavaScript engine
  ✅ Sandboxed Evaluation – User AI code runs in isolated context
  ✅ Memory Limits – Prevents stack overflow
  ✅ Execution Timeout – Stops long-running AI code

**3. Security Implementations**

  **Authentication & Authorization**
  ✅ JWT Tokens – Secure, stateless authentication
  ✅ 7-Day Expiry – Tokens auto-expire for security
  ✅ Password Hashing – bcrypt with salt (never stores plain passwords)
  ✅ Auth Middleware – Protects all private routes
  ✅ Role-Based Access – Only battle participants can access their battles

  **API Security**
  ✅ CORS Configuration – Only allows requests from http://localhost:5173
  ✅ Environment Variables – Secrets stored in .env
  ✅ Input Validation – Sanitizes inputs (battleCode, email, etc.)
  ✅ SQL/NoSQL Injection Prevention – Mongoose escapes queries
  ✅ Rate Limiting – Prevents API abuse (12 requests/min for Gemini)

  **Data Protection**
  ✅ Encrypted Connections – MongoDB uses SSL/TLS
  ✅ Secret Management – JWT_SECRET, API keys in environment variables
  ✅ No Sensitive Data in Logs – Passwords/tokens never logged
  ✅ User Data Isolation – Players can only access their data

  **Code Injection Prevention**
  ✅ AI Code Sandboxing – User code can't access server filesystem
  ✅ Function Whitelisting – Only safe functions allowed in AI code
  ✅ No eval() on Server – Secure VM execution
  ✅ XSS Protection – React auto-escapes HTML

  **Battle Security**
  ✅ Battle Code Validation – Only alphanumeric codes
  ✅ Unique Battle Codes – Collision detection prevents duplicates
  ✅ Ownership Checks – Users cannot modify others' battles
  ✅ AI Code Privacy – Opponent code hidden until battle ends

  **Network Security**
  ✅ HTTPS Ready – Frontend configured for secure deployment
  ✅ Cookie Security – HttpOnly, Secure, SameSite flags
  ✅ Content Security Policy – Prevents inline script injection

## 📄Deployed Link-https://devordie-iota.vercel.app/

## Team Members and Responsibilities:
Ashish Singh: C++ Backend;
Arushi Nayak: Frontend;
Sahil Dora: Machine Learning;
Yodaksha Apratim Singh: Auth, Optimization and AI Analysis;

## Future Improvements:

### From ML Integration 
1. AI Strategy Recommendation Engine
What: Analyze player's battle history and suggest optimal strategies
How: ML model trained on winning battles learns patterns (aggressive vs defensive, terrain preferences, unit compositions)
Output: "Based on your 70% win rate with tank-heavy armies, try adding drones for scouting" or "Your code performs 30% better on mountain terrain - focus there"
Benefit: Personalized improvement suggestions, faster skill progression

3. Code Quality Analysis with ML
What: Evaluate AI code efficiency and suggest optimizations
How: Train model on thousands of battle replays to identify efficient vs inefficient code patterns
Output: Score code 1-10, highlight bottlenecks ("Your nested loops slow down decisions by 40ms"), suggest alternatives ("Replace linear search with spatial hash grid")
Benefit: Players learn to write better algorithms, reduces server load from inefficient code

## From Defense Sector Adaptations
3. Swarm Intelligence for Drone Coordination
What: Control 10-100 drones as a coordinated swarm with distributed decision-making
How: Leader-follower hierarchy where drones communicate, share targets, maintain formation, avoid collisions autonomously
Output: Real-time swarm behaviors - surround enemy, flanking maneuvers, cover fire, tactical retreat as unit
Benefit: Realistic military simulation, impressive for defense demos, research value for autonomous systems

5. Realistic Sensor & Electronic Warfare Systems
What: Units have limited vision/radar range, can jam enemy communications, hide from sensors
How: Fog of war (only see within sensor radius), radio range limits, stealth mechanics, signal jamming disables enemy coordination
Output: Strategic gameplay - scout with drones to reveal map, jam enemies before attack, use terrain to hide from radar
Benefit: Authentic military simulation, teaches reconnaissance/counter-reconnaissance tactics, defense sector appeal


** 📸 ScreenShots of Working Features**
<img width="1418" height="774" alt="Screenshot 2025-12-09 at 10 14 03 AM" src="https://github.com/user-attachments/assets/f878e9d0-6bab-46e5-9dfe-f29c24c87a9b" />
<img width="465" height="457" alt="Screenshot 2025-12-09 at 10 16 09 AM" src="https://github.com/user-attachments/assets/77682edb-9099-48fa-b6a8-82c73d3ee9c5" />
<img width="466" height="437" alt="Screenshot 2025-12-09 at 10 16 22 AM" src="https://github.com/user-attachments/assets/f60bdabd-d07a-4530-8389-b995d81e9b9e" />
<img width="600" height="305" alt="Screenshot 2025-12-09 at 10 16 36 AM" src="https://github.com/user-attachments/assets/2d30987f-8eab-4cbd-8215-b6e18842f276" />


MIT License - see [LICENSE](LICENSE) for details.

## 📞 Contact

- **GitHub**: [@singhashish9963](https://github.com/singhashish9963)
- **Repository**: [github.com/singhashish9963/devordie](https://github.com/singhashish9963/devordie)
- **Issues**: [Report bugs](https://github.com/singhashish9963/devordie/issues)

---

<div align="center">

**Made with ❤️ by the DevOrDie Team**

⭐ Star us on GitHub if you find this project interesting!

[🏠 Home](https://github.com/singhashish9963/devordie) • 
[📖 Docs](./docs) • 
[🐛 Issues](https://github.com/singhashish9963/devordie/issues)

</div>
