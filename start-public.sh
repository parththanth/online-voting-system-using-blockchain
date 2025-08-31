#!/bin/bash

echo "🚀 Starting VoteGuard Public Deployment..."

# Check if LocalTunnel is installed
if ! command -v lt &> /dev/null; then
    echo "📦 Installing LocalTunnel..."
    npm install -g localtunnel
fi

# Kill any existing processes
echo "🔄 Stopping existing services..."
pkill -f "vite" 2>/dev/null || true
pkill -f "localtunnel" 2>/dev/null || true
pkill -f "lt --port" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

echo "🔧 Starting Vite dev server..."
# Start Vite in background with host allowance for LocalTunnel
npm run dev -- --host 0.0.0.0 --port 8080 &
VITE_PID=$!

# Wait for Vite to start
echo "⏳ Waiting for Vite server to start..."
sleep 5

# Check if Vite is running
if ! curl -s http://localhost:8080 > /dev/null; then
    echo "❌ Vite server failed to start"
    exit 1
fi

echo "🌐 Starting LocalTunnel..."
# Start LocalTunnel with subdomain
lt --port 8080 --subdomain voteguard &
LT_PID=$!

# Save PIDs for cleanup
echo $VITE_PID > .vite.pid
echo $LT_PID > .lt.pid

echo "✅ VoteGuard is now publicly accessible!"
echo "🔗 URL: https://voteguard.loca.lt"
echo ""
echo "📝 To stop the services, run: ./stop-public.sh"
echo "📱 The public URL will update automatically when you make local changes"
echo ""
echo "🔍 Monitoring services... (Press Ctrl+C to stop monitoring)"

# Monitor the services
while true; do
    if ! kill -0 $VITE_PID 2>/dev/null; then
        echo "❌ Vite server stopped unexpectedly"
        break
    fi
    if ! kill -0 $LT_PID 2>/dev/null; then
        echo "❌ LocalTunnel stopped unexpectedly"
        break
    fi
    sleep 30
done
