#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  PunchCard - Build & Run Script${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Set JAVA_HOME if not already set
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" ]; then
        export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
        export PATH="$JAVA_HOME/bin:$PATH"
        echo -e "${GREEN}✓${NC} Set JAVA_HOME to $JAVA_HOME"
    else
        echo -e "${RED}✗ Java 21 not found. Please install with: brew install openjdk@21${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}[1/3] Running tests...${NC}"
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
echo -e "${YELLOW}[2/3] Starting application...${NC}"
echo ""

# Start the app in background
./gradlew bootRun --quiet &
APP_PID=$!

# Wait for app to start
echo -n "Waiting for server to start"
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓ Server started on http://localhost:8080${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Check if app started successfully
if ! curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo ""
    echo -e "${RED}✗ Server failed to start within 30 seconds${NC}"
    kill $APP_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${YELLOW}[3/3] Testing endpoints...${NC}"
echo ""

# Test hello endpoint
echo -n "GET /api/hello ... "
RESPONSE=$(curl -s http://localhost:8080/api/hello)
if [ "$RESPONSE" = "Hello World" ]; then
    echo -e "${GREEN}✓${NC} Response: $RESPONSE"
else
    echo -e "${RED}✗${NC} Unexpected response: $RESPONSE"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Application running at http://localhost:8080${NC}"
echo -e "${GREEN}  Press Ctrl+C to stop${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Handle Ctrl+C gracefully
trap "echo ''; echo -e '${YELLOW}Shutting down...${NC}'; kill $APP_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for app to finish (keeps script running)
wait $APP_PID

