#!/bin/bash

# Build script for WASM using Emscripten

echo "Building Battle Simulator WASM module..."

# Check if emscripten is installed
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten not found. Please install Emscripten SDK first."
    echo "Visit: https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Create build directory
mkdir -p build-wasm
cd build-wasm

# Configure with emscripten
emcmake cmake ..

# Build
emmake make

# Check if build was successful
if [ -f "wasm-build/battle_sim.js" ] && [ -f "wasm-build/battle_sim.wasm" ]; then
    echo "✅ Build successful!"
    echo "Output files:"
    echo "  - wasm-build/battle_sim.js"
    echo "  - wasm-build/battle_sim.wasm"
else
    echo "❌ Build failed"
    exit 1
fi
