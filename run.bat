@echo off
title ReA - AI Resume Analyzer
cd /d "%~dp0"

echo ========================================================
echo             ReA - AI Resume Analyzer
echo        (Cream ^& Beige Luxury Edition)
echo ========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [INFO] First time setup detected. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed!
    echo.
)

echo [INFO] Launching ReA server on http://localhost:5173 ...
echo [INFO] Press Ctrl+C in this window anytime to stop the server.
echo.

:: Launch dev server and automatically open the default browser
call npm run dev -- --open --host 127.0.0.1
