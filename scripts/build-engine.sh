#!/bin/bash

# Build WASM engine script

set -e

echo "🔧 Building Battle Simulator Engine..."

cd engine

# Clean previous build
if [ -d "wasm-build" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf wasm-build
fi

# Create build directory
mkdir -p wasm-build
cd wasm-build

# Configure with Emscripten
echo "⚙️  Configuring with Emscripten..."
emcmake cmake ..

# Build
echo "🔨 Building..."
emmake make

echo "✅ WASM build complete!"
echo "📁 Output files are in engine/wasm-build/"
ls -lh *.wasm *.js 2>/dev/null || echo "Build files not found"
