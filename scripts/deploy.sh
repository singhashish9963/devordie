#!/bin/bash

# Build and deploy script for Battle Simulator

set -e

echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Build backend
echo "📦 Preparing backend..."
cd backend
npm install --production
cd ..

# Build WASM engine
echo "🔧 Building WASM engine..."
cd engine
mkdir -p wasm-build
cd wasm-build
emcmake cmake ..
emmake make
cd ../..

# Copy files to deployment directory
echo "📋 Copying files..."
mkdir -p deploy
cp -r frontend/dist deploy/frontend
cp -r backend deploy/backend
cp -r engine/wasm-build/*.wasm deploy/backend/wasm
cp -r engine/wasm-build/*.js deploy/backend/wasm

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf battle-simulator-deploy.tar.gz deploy/

echo "✅ Deployment package created: battle-simulator-deploy.tar.gz"
echo "🎉 Deployment process complete!"
