#!/bin/bash

# AO Cook Chatbot Development Startup Script

echo "🚀 Starting AO Cook Chatbot Development Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .envSAMPLE..."
    cp .envSAMPLE .env
    echo "📝 Please edit .env and add your OpenAI API key"
    echo "   OPENAI_API_KEY=your_openai_api_key_here"
    exit 1
fi

# Check if OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=" .env || grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env; then
    echo "⚠️  Please set your OpenAI API key in .env file"
    echo "   OPENAI_API_KEY=your_actual_api_key_here"
    exit 1
fi

echo "✅ Environment check passed"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use. Stopping existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check and clear ports
echo "🔍 Checking ports..."
check_port 3001
check_port 3000

echo "🔧 Starting backend server on port 3001..."
bun run server:dev &
BACKEND_PID=$!

# Wait for backend to fully start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend failed to start. Check the logs above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend server is running on port 3001"

echo "🎨 Starting frontend server on port 3000..."
bun run frontend:dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

echo "✅ Both servers are starting..."
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait 