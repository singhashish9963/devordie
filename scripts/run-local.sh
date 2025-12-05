#!/bin/bash

# Run Battle Simulator locally

set -e

echo "🎮 Starting Battle Simulator..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
}

trap cleanup EXIT

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend dev server..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Battle Simulator is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:5001"
echo "Press Ctrl+C to stop"

# Wait for user to stop
wait
