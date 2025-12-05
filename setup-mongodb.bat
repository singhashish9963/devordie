@echo off
echo ================================================
echo MongoDB Setup Helper for DevOrDie
echo ================================================
echo.

echo Checking if MongoDB is installed...
where mongod >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB is installed!
    mongod --version
    echo.
    echo Starting MongoDB...
    echo.
    echo MongoDB will run on: mongodb://localhost:27017
    echo Database name: devordie
    echo.
    echo Press Ctrl+C to stop MongoDB
    echo.
    mongod --dbpath="C:\data\db"
) else (
    echo [ERROR] MongoDB is not installed!
    echo.
    echo Please choose one of these options:
    echo.
    echo 1. Install MongoDB Community Server
    echo    Download from: https://www.mongodb.com/try/download/community
    echo    After install, create data directory: mkdir C:\data\db
    echo.
    echo 2. Use Docker
    echo    Run: docker run -d -p 27017:27017 --name mongodb mongo:latest
    echo.
    echo 3. Use MongoDB Atlas (Cloud - Free)
    echo    Sign up: https://www.mongodb.com/cloud/atlas/register
    echo    Update MONGODB_URI in backend\.env with your connection string
    echo.
    pause
)
