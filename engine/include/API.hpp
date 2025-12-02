#ifndef API_HPP
#define API_HPP

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define WASM_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define WASM_EXPORT
#endif

extern "C" {
    // Initialize simulation
    WASM_EXPORT void* createSimulation(int width, int height);
    
    // Add unit to simulation
    WASM_EXPORT void addUnit(void* sim, int id, const char* name, int type, int x, int y);
    
    // Run simulation
    WASM_EXPORT void runSimulation(void* sim, int steps);
    
    // Get simulation state
    WASM_EXPORT const char* getSimulationState(void* sim);
    
    // Clean up
    WASM_EXPORT void destroySimulation(void* sim);
}

#endif // API_HPP
