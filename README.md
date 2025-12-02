# Battle Simulator

A full-stack battle simulation platform where users can create custom units, design battle logic, and watch epic battles unfold!

## 🎮 Features

- **Visual Logic Builder**: Create unit behavior without coding
- **Battle Simulation**: Watch your units fight in real-time
- **High Performance**: C++ engine compiled to WebAssembly
- **Customizable Units**: Design warriors, archers, and mages
- **Strategic Gameplay**: Plan tactics and watch them execute

## 🏗️ Architecture

```
battle-simulator/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express API
├── engine/            # C++ simulation engine (WASM)
├── database/          # SQL schema and migrations
├── docs/              # Documentation
└── scripts/           # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Emscripten (for WASM build)
- PostgreSQL or MongoDB

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/battle-simulator.git
   cd battle-simulator
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Run everything (from root)
   ./scripts/run-local.sh
   
   # Or manually:
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Docker Deployment

```bash
docker-compose up -d
```

## 🔧 Building the WASM Engine

```bash
cd engine
./scripts/build-engine.sh
```

## 📚 Documentation

- [System Architecture](docs/system-architecture.md)
- [API Design](docs/API-design.md)
- [Feature Specifications](docs/feature-specs.md)
- [Development Roadmap](docs/roadmap.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (future)
cd frontend
npm test
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Context API for state management

### Backend
- Node.js
- Express
- MongoDB/PostgreSQL
- JWT Authentication

### Engine
- C++17
- CMake
- Emscripten (WebAssembly)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Inspiration from classic strategy games
- WebAssembly community
- Open source contributors

## 📧 Contact

For questions or support, please open an issue or contact [your-email@example.com]

---

**Happy Battling!** ⚔️
