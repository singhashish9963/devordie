#include "SimulationEngine.hpp"

namespace BattleSimulator {

SimulationEngine::SimulationEngine(int mapWidth, int mapHeight)
    : currentStep_(0), finished_(false) {
    map_ = std::make_unique<Map>(mapWidth, mapHeight);
}

SimulationEngine::~SimulationEngine() {
}

void SimulationEngine::addUnit(std::shared_ptr<Unit> unit) {
    units_.push_back(unit);
}

void SimulationEngine::removeUnit(int unitId) {
    units_.erase(
        std::remove_if(units_.begin(), units_.end(),
            [unitId](const std::shared_ptr<Unit>& unit) {
                return unit->getId() == unitId;
            }),
        units_.end()
    );
}

void SimulationEngine::step() {
    if (finished_) return;

    // Process each unit
    for (auto& unit : units_) {
        if (unit->isAlive()) {
            processUnit(unit);
        }
    }

    currentStep_++;
    checkWinCondition();
}

void SimulationEngine::run(int maxSteps) {
    for (int i = 0; i < maxSteps && !finished_; ++i) {
        step();
    }
}

bool SimulationEngine::isFinished() const {
    return finished_;
}

void SimulationEngine::processUnit(std::shared_ptr<Unit> unit) {
    // Basic unit processing logic
    // TODO: Implement full combat logic
}

void SimulationEngine::checkWinCondition() {
    // Check if only one team remains
    int aliveUnits = 0;
    for (const auto& unit : units_) {
        if (unit->isAlive()) {
            aliveUnits++;
        }
    }

    if (aliveUnits <= 1) {
        finished_ = true;
    }
}

} // namespace BattleSimulator
