#pragma once

#include <memory>
#include <vector>
#include <algorithm>

#include "SimulationEngine.hpp"
#include "Map.hpp"
#include "Unit.hpp"

namespace BattleSimulator {

class SimulationEngine {
public:
    SimulationEngine(int mapWidth, int mapHeight)
        : map_(std::make_unique<Map>(mapWidth, mapHeight)),
          currentStep_(0),
          finished_(false) {}

    ~SimulationEngine() = default;

    void addUnit(std::shared_ptr<Unit> unit) {
        if (unit) {
            units_.push_back(std::move(unit));
        }
    }

    
    void removeUnit(int unitId) {
#if __cpp_lib_erase_if >= 202002L
        std::erase_if(units_, [unitId](const std::shared_ptr<Unit>& unit) {
            return unit && unit->getId() == unitId;
        });
#else
        units_.erase(
            std::remove_if(units_.begin(), units_.end(),
                [unitId](const std::shared_ptr<Unit>& unit) {
                    return unit && unit->getId() == unitId;
                }),
            units_.end()
        );
#endif
    }

    void step() {
        if (finished_) {
            return;
        }

        // Process each alive unit for this step
        for (auto& unit : units_) {
            if (unit && unit->isAlive()) {
                processUnit(*unit);
            }
        }

        ++currentStep_;
        checkWinCondition();
    }

    void run(int maxSteps) {
        for (int i = 0; i < maxSteps && !finished_; ++i) {
            step();
        }
    }

    [[nodiscard]] bool isFinished() const noexcept {
        return finished_;
    }

    [[nodiscard]] int currentStep() const noexcept {
        return currentStep_;
    }

    [[nodiscard]] const Map& map() const noexcept {
        return *map_;
    }

    [[nodiscard]] Map& map() noexcept {
        return *map_;
    }

private:
    void processUnit(Unit& unit) {
        // Basic unit processing logic
        // TODO: Implement full combat / movement / AI logic
        // Example structure:
        // 1. Decide action (move / attack / wait)
        // 2. Resolve action against map_ and other units_
        // 3. Update unit state (health, cooldowns, etc.)
    }

    void checkWinCondition() {
        int aliveUnits = 0;
        for (const auto& unit : units_) {
            if (unit && unit->isAlive()) {
                ++aliveUnits;
                if (aliveUnits > 1) {
                    return; // Early exit, simulation continues
                }
            }
        }

        // Zero or one unit left alive: simulation finished
        finished_ = true;
    }

private:
    std::unique_ptr<Map> map_;
    std::vector<std::shared_ptr<Unit>> units_;
    int currentStep_;
    bool finished_;
};

} // namespace BattleSimulator
