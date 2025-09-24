@echo off
REM PunchCard Backend Run Script for Windows
REM This script builds and runs the Go backend server

echo 🚀 Starting PunchCard Backend...

REM Check if Go is installed
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Go is not installed or not in PATH
    echo Please install Go 1.24.0 or later from https://golang.org/dl/
    pause
    exit /b 1
)

echo ✅ Go is installed

REM Install dependencies
echo 📦 Installing dependencies...
go mod tidy
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Build the application
echo 🔨 Building application...
go build -o punchcard-backend.exe .
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Set default port
if "%PORT%"=="" set PORT=8080

REM Run the application
echo 🌟 Starting server on port %PORT%...
echo    Health check: http://localhost:%PORT%/health
echo    API docs: http://localhost:%PORT%/api/users
echo.
echo Press Ctrl+C to stop the server
echo ----------------------------------------

punchcard-backend.exe
