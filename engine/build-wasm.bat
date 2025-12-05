@echo off
REM Build script for WASM using Emscripten on Windows

echo Building Battle Simulator WASM module...

REM Check if emscripten is available
where emcc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Emscripten not found. Please install Emscripten SDK first.
    echo Visit: https://emscripten.org/docs/getting_started/downloads.html
    exit /b 1
)

REM Create build directory
if not exist build-wasm mkdir build-wasm
cd build-wasm

REM Configure with emscripten
call emcmake cmake ..

REM Build
call emmake make

REM Check if build was successful
if exist "wasm-build\battle_sim.js" if exist "wasm-build\battle_sim.wasm" (
    echo ✅ Build successful!
    echo Output files:
    echo   - wasm-build\battle_sim.js
    echo   - wasm-build\battle_sim.wasm
) else (
    echo ❌ Build failed
    exit /b 1
)

cd ..
