# Battle Simulator Engine

This is the C++ simulation engine that powers the battle simulator. It can be compiled to WebAssembly for use in the browser.

## Building

### Native Build
```bash
mkdir build
cd build
cmake ..
make
```

### WebAssembly Build
```bash
mkdir wasm-build
cd wasm-build
emcmake cmake ..
emmake make
```

## Architecture

- **Types.hpp**: Core data structures and enums
- **Map.hpp/cpp**: Grid-based battle map
- **Unit.hpp/cpp**: Unit representation and stats
- **Logic.hpp/cpp**: AI and decision-making logic
- **SimulationEngine.hpp/cpp**: Main simulation loop
- **API.hpp/cpp**: C API for WebAssembly bindings
