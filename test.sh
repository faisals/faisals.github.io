#!/bin/bash

# Test script for Tufte Personal Site
# Builds the site, starts Python server, and opens in browser
# Updated with recent bug fixes validation

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

# Step 5: Open in Chrome browser
echo "🌐 Opening http://localhost:$PORT in Chrome..."

if command -v open &> /dev/null; then
    # macOS - open in Chrome
    if [ -d "/Applications/Google Chrome.app" ]; then
        open -a "Google Chrome" "http://localhost:$PORT"
    else
        echo "⚠️  Chrome not found. Opening in default browser..."
        open "http://localhost:$PORT"
    fi
elif command -v google-chrome &> /dev/null; then
    # Linux - Chrome
    google-chrome "http://localhost:$PORT" &
elif command -v google-chrome-stable &> /dev/null; then
    # Linux - Chrome stable
    google-chrome-stable "http://localhost:$PORT" &
elif command -v chromium-browser &> /dev/null; then
    # Linux - Chromium
    chromium-browser "http://localhost:$PORT" &
elif command -v start &> /dev/null; then
    # Windows - Chrome
    start chrome "http://localhost:$PORT" 2>/dev/null || start "http://localhost:$PORT"
else
    echo "🔗 Chrome not found. Please manually open: http://localhost:$PORT"
fi

echo ""
echo "✅ Site is running at http://localhost:$PORT"
echo "📋 Testing checklist:"
echo "   □ Skeleton loading appears briefly"
echo "   □ Content loads smoothly with fade transition"
echo "   □ Typography scale looks consistent (h1→3.2rem, h2→2.4rem, h3→1.8rem)"
echo "   □ Timeline animation works without console errors"
echo "   □ NO duplicate canvases or double animations"
echo "   □ Minified CSS assets are served (check Network tab)"
echo "   □ Navigation TOC appears on right side with smooth scrolling"
echo "   □ Skill tags have hover effects and transitions"
echo "   □ Animated metrics display properly with underline on hover"
echo "   □ Network graph works without issues"
echo "   □ Font loads smoothly with preload"
echo "   □ Animations respect prefers-reduced-motion setting"
echo "   □ SEO meta tags present in <head> (check View Source)"
echo "   □ Site is responsive on mobile/tablet/desktop"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"

# Step 6: Keep server running until user stops it
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; echo '✅ Server stopped.'; exit 0" INT

# Wait for server process
wait $SERVER_PID