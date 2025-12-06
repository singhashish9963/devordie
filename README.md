# 🎮 DevOrDie - AI Battle Simulator

> **Code Your Army. Dominate the Battlefield.**

A cutting-edge, full-stack battle simulation platform where players write JavaScript AI strategies to control autonomous armies in real-time tactical combat. Built with **C++ WebAssembly** for blazing-fast simulations (10-100x faster) and a modern React frontend.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![C++](https://img.shields.io/badge/C++-17-00599C.svg)](https://isocpp.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-654FF0.svg)](https://webassembly.org/)

---

## 🌟 Overview

**DevOrDie** is a sophisticated AI programming game where players design battle strategies through code. Write JavaScript AI logic to control units like soldiers, archers, tanks, drones, and snipers on customizable terrains with real-time tactical combat visualization.

### 🎯 What Makes It Special

- ⚡ **High-Performance C++ WASM Engine** - 10-100x faster than pure JavaScript
- 🎨 **Visual Terrain Editor** - 8 terrain types with unique combat effects  
- 💻 **Code-Driven AI** - Write JavaScript strategies with full battle awareness
- 🔄 **Real-Time Visualization** - Smooth Canvas animations with live stats
- 🏆 **Multiplayer Infrastructure** - Ready for ranked competitive battles

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

## ⚡ WASM Performance

### Real Benchmark (5v5, 500 ticks)

| Metric | JavaScript | C++ WASM | Speedup |
|--------|-----------|----------|---------|
| Execution | 1,847ms | 42ms | **44x faster** |
| Ticks/sec | 270 | 11,905 | **44x more** |
| Memory | 18MB | 5MB | **3.6x less** |

### Verification
1. Server logs: `⚡ Battle Engine: WASM C++ (High Performance)`
2. UI badge: `⚡ C++ WASM` in simulation controls
3. Benchmark tool: Click "⚡ Engine Benchmark" button
4. Network tab: See `battle_sim.wasm` loaded
5. File check: `backend/wasm/battle_sim.wasm` exists

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

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

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
