#include "API.hpp"
#include "SimulationEngine.hpp"
#include <string>

using namespace BattleSimulator;

extern "C" {

WASM_EXPORT void* createSimulation(int width, int height) {
    return new SimulationEngine(width, height);
}

WASM_EXPORT void addUnit(void* sim, int id, const char* name, int type, int x, int y) {
    SimulationEngine* engine = static_cast<SimulationEngine*>(sim);
    Position pos{x, y};
    auto unit = std::make_shared<Unit>(id, name, static_cast<UnitType>(type), pos);
    engine->addUnit(unit);
}

WASM_EXPORT void runSimulation(void* sim, int steps) {
    SimulationEngine* engine = static_cast<SimulationEngine*>(sim);
    engine->run(steps);
}

WASM_EXPORT const char* getSimulationState(void* sim) {
    // TODO: Serialize simulation state to JSON
    return "{}";
}

WASM_EXPORT void destroySimulation(void* sim) {
    SimulationEngine* engine = static_cast<SimulationEngine*>(sim);
    delete engine;
}

}
