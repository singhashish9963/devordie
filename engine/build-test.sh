#!/bin/bash

# Build and run tests (native C++ build)

echo "Building Battle Simulator tests..."

# Create build directory
mkdir -p build-test
cd build-test

# Configure
cmake ..

# Build
make

# Run tests
if [ -f "battle_sim_test" ]; then
    echo "Running tests..."
    ./battle_sim_test
else
    echo "❌ Build failed"
    exit 1
fi
