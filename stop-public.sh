#!/bin/bash

echo "🛑 Stopping VoteGuard Public Deployment..."

# Kill processes using PID files if they exist
if [ -f .vite.pid ]; then
    VITE_PID=$(cat .vite.pid)
    if kill -0 $VITE_PID 2>/dev/null; then
        echo "🔄 Stopping Vite server (PID: $VITE_PID)..."
        kill $VITE_PID
    fi
    rm .vite.pid
fi

if [ -f .lt.pid ]; then
    LT_PID=$(cat .lt.pid)
    if kill -0 $LT_PID 2>/dev/null; then
        echo "🔄 Stopping LocalTunnel (PID: $LT_PID)..."
        kill $LT_PID
    fi
    rm .lt.pid
fi

# Fallback: kill any remaining processes
echo "🧹 Cleaning up any remaining processes..."
pkill -f "vite" 2>/dev/null || true
pkill -f "localtunnel" 2>/dev/null || true
pkill -f "lt --port" 2>/dev/null || true

echo "✅ All services stopped successfully!"
echo "🔗 Public URL is no longer accessible"
