#ifndef SIMULATION_ENGINE_HPP
#define SIMULATION_ENGINE_HPP

#include "Types.hpp"
#include "Map.hpp"
#include "Unit.hpp"
#include <vector>
#include <memory>

namespace BattleSimulator {

class SimulationEngine {
public:
    SimulationEngine(int mapWidth, int mapHeight);
    ~SimulationEngine();

    void addUnit(std::shared_ptr<Unit> unit);
    void removeUnit(int unitId);
    void step();
    void run(int maxSteps);
    bool isFinished() const;

private:
    std::unique_ptr<Map> map_;
    std::vector<std::shared_ptr<Unit>> units_;
    int currentStep_;
    bool finished_;

    void processUnit(std::shared_ptr<Unit> unit);
    void checkWinCondition();
};

} // namespace BattleSimulator

#endif // SIMULATION_ENGINE_HPP
