#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  PunchCard - Full Stack Build & Run Script${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cleanup function
cleanup() {
    echo ''
    echo -e "${YELLOW}Shutting down...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    # Kill any remaining gradle/node processes
    pkill -f "gradlew.*bootRun" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    echo -e "${GREEN}Goodbye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Set JAVA_HOME if not already set
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" ]; then
        export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
        export PATH="$JAVA_HOME/bin:$PATH"
        echo -e "${GREEN}✓${NC} Set JAVA_HOME to $JAVA_HOME"
    elif [ -d "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home" ]; then
        export JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
        export PATH="$JAVA_HOME/bin:$PATH"
        echo -e "${GREEN}✓${NC} Set JAVA_HOME to $JAVA_HOME"
    else
        echo -e "${RED}✗ Java not found. Please install with: brew install openjdk@21${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}[1/4] Running backend tests...${NC}"
echo ""

if ./gradlew test --quiet; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
else
    echo ""
    echo -e "${RED}✗ Tests failed. Aborting.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/4] Installing frontend dependencies...${NC}"
echo ""

cd frontend
if command -v bun &> /dev/null; then
    bun install --silent
    echo -e "${GREEN}✓ Frontend dependencies installed (bun)${NC}"
elif command -v npm &> /dev/null; then
    npm install --silent
    echo -e "${GREEN}✓ Frontend dependencies installed (npm)${NC}"
else
    echo -e "${RED}✗ Neither bun nor npm found. Please install bun or Node.js${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}[3/4] Starting backend (dev profile with H2)...${NC}"
echo ""

# Start the backend with dev profile (H2 in-memory database)
./gradlew bootRun --args='--spring.profiles.active=dev' --quiet &
BACKEND_PID=$!

# Wait for backend to start
echo -n "Waiting for backend"
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓ Backend started on http://localhost:8080${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Check if backend started successfully
if ! curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo ""
    echo -e "${RED}✗ Backend failed to start within 30 seconds${NC}"
    cleanup
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/4] Starting frontend...${NC}"
echo ""

cd frontend
if command -v bun &> /dev/null; then
    bun run dev &
    FRONTEND_PID=$!
elif command -v npm &> /dev/null; then
    npm run dev &
    FRONTEND_PID=$!
fi
cd ..

# Wait for frontend to start
sleep 3
echo -e "${GREEN}✓ Frontend started on http://localhost:5173${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  PunchCard is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:5173"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:8080"
echo -e "  ${BLUE}H2 Console:${NC} http://localhost:8080/h2-console"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for either process to finish
wait $BACKEND_PID $FRONTEND_PID
