#!/bin/bash

# Test script for Tufte Personal Site
# Builds the site, starts Python server, and opens in browser

set -e  # Exit on any error

echo "🧪 Testing Tufte Personal Site..."
echo "=================================="

# Step 1: Build the site
echo "📦 Building site..."
node build.js

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 Starting local server..."

# Step 2: Find available port (starting from 8000)
PORT=8000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done

echo "📡 Server will run on http://localhost:$PORT"

# Step 3: Start Python server in background
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT &
elif command -v python &> /dev/null; then
    python -m http.server $PORT &
else
    echo "❌ Python not found! Please install Python to run the test server."
    exit 1
fi

SERVER_PID=$!

# Step 4: Wait a moment for server to start
sleep 2

# Step 5: Open in browser
echo "🌐 Opening http://localhost:$PORT in browser..."

if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:$PORT"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:$PORT"
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:$PORT"
else
    echo "🔗 Please manually open: http://localhost:$PORT"
fi

echo ""
echo "✅ Site is running at http://localhost:$PORT"
echo "📋 Testing checklist:"
echo "   □ Skeleton loading appears briefly"
echo "   □ Content loads smoothly with fade transition"
echo "   □ Typography scale looks consistent (h1→3.2rem, h2→2.4rem, h3→1.8rem)"
echo "   □ Animations work properly"
echo "   □ Site is responsive on mobile"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"

# Step 6: Keep server running until user stops it
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; echo '✅ Server stopped.'; exit 0" INT

# Wait for server process
wait $SERVER_PID