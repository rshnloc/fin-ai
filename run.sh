#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "    Starting FinAI (Zero-Docker, Zero-Credentials)"
echo "=================================================="

# Check Python environment
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install --upgrade pip
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# Check Node environment
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "-> Starting Backend API server on http://127.0.0.1:8000 ..."
cd "$DIR/backend"
PYTHONPATH=. ./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "-> Starting Frontend UI server on http://localhost:5173 ..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Trap Ctrl+C to cleanly kill both processes
cleanup() {
    echo ""
    echo "Shutting down FinAI servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo ""
echo "FinAI is now running:"
echo "  • Frontend Web UI: http://localhost:5173"
echo "  • Backend API & Docs: http://127.0.0.1:8000/docs"
echo "  • Privacy Policy: Zero credentials, zero PII, 100% local SQLite storage"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait for background processes
wait
