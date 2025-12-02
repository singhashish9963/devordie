# Battle Simulator - System Architecture

## Overview
The Battle Simulator is a full-stack application with a React frontend, Node.js backend, and C++ simulation engine compiled to WebAssembly.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  - Logic Builder UI                                      │
│  - Battle Grid Visualization                             │
│  - Real-time simulation display                          │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST API
                 ▼
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js/Express)                 │
│  - API Routes                                            │
│  - Business Logic                                        │
│  - Database Operations                                   │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             ▼                       ▼
┌────────────────────┐   ┌──────────────────────────────┐
│   Database (SQL)   │   │  Simulation Engine (WASM)    │
│  - User data       │   │  - C++ Core                  │
│  - Unit configs    │   │  - Battle logic              │
│  - Simulations     │   │  - Compiled to WebAssembly   │
└────────────────────┘   └──────────────────────────────┘
```

## Components

### Frontend
- **Framework**: React with Vite
- **State Management**: Context API
- **Key Features**:
  - Visual logic builder
  - Interactive battle grid
  - Real-time simulation playback

### Backend
- **Framework**: Node.js with Express
- **Database**: MongoDB/PostgreSQL
- **Key Features**:
  - RESTful API
  - User authentication
  - Simulation orchestration

### Engine
- **Language**: C++17
- **Build**: CMake + Emscripten
- **Key Features**:
  - High-performance simulation
  - WebAssembly compatibility
  - Custom unit logic execution

## Data Flow

1. User creates units and logic via frontend
2. Configuration sent to backend via API
3. Backend validates and stores in database
4. On simulation start, backend loads WASM module
5. Simulation runs in WASM, results stream back
6. Frontend displays results in real-time
