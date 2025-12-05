#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "BattleEngine.h"

using namespace emscripten;
using namespace BattleSimulator;

// WASM bindings for JavaScript
EMSCRIPTEN_BINDINGS(battle_simulator) {
    // Position
    value_object<Position>("Position")
        .field("x", &Position::x)
        .field("y", &Position::y);
    
    // Unit
    value_object<Unit>("Unit")
        .field("id", &Unit::id)
        .field("team", &Unit::team)
        .field("type", &Unit::type)
        .field("position", &Unit::position)
        .field("health", &Unit::health)
        .field("maxHealth", &Unit::maxHealth)
        .field("attack", &Unit::attack)
        .field("defense", &Unit::defense)
        .field("speed", &Unit::speed)
        .field("range", &Unit::range)
        .field("alive", &Unit::alive)
        .field("cooldown", &Unit::cooldown);
    
    // TerrainCell
    value_object<TerrainCell>("TerrainCell")
        .field("type", &TerrainCell::type)
        .field("moveCost", &TerrainCell::moveCost);
    
    // Action
    value_object<Action>("Action")
        .field("type", &Action::type)
        .field("targetPosition", &Action::targetPosition)
        .field("targetUnitId", &Action::targetUnitId)
        .field("direction", &Action::direction);
    
    enum_<Action::Type>("ActionType")
        .value("IDLE", Action::IDLE)
        .value("MOVE", Action::MOVE)
        .value("ATTACK", Action::ATTACK);
    
    // BattleState
    value_object<BattleState>("BattleState")
        .field("tick", &BattleState::tick)
        .field("units", &BattleState::units)
        .field("status", &BattleState::status)
        .field("winner", &BattleState::winner)
        .field("logs", &BattleState::logs);
    
    // BattleStats
    value_object<BattleEngine::BattleStats>("BattleStats")
        .field("totalTicks", &BattleEngine::BattleStats::totalTicks)
        .field("winner", &BattleEngine::BattleStats::winner)
        .field("teamAUnitsRemaining", &BattleEngine::BattleStats::teamAUnitsRemaining)
        .field("teamBUnitsRemaining", &BattleEngine::BattleStats::teamBUnitsRemaining)
        .field("totalDamageDealt", &BattleEngine::BattleStats::totalDamageDealt)
        .field("logs", &BattleEngine::BattleStats::logs);
    
    // BattleEngine
    class_<BattleEngine>("BattleEngine")
        .constructor<int, int, int>()
        .function("addUnit", &BattleEngine::addUnit)
        .function("initialize", &BattleEngine::initialize)
        .function("tick", &BattleEngine::tick)
        .function("run", &BattleEngine::run)
        .function("reset", &BattleEngine::reset)
        .function("getState", &BattleEngine::getState)
        .function("isFinished", &BattleEngine::isFinished)
        .function("getCurrentTick", &BattleEngine::getCurrentTick)
        .function("getWinner", &BattleEngine::getWinner)
        .function("getAliveUnits", &BattleEngine::getAliveUnits)
        .function("getTeamUnits", &BattleEngine::getTeamUnits)
        .function("getTeamAliveCount", &BattleEngine::getTeamAliveCount)
        .function("getBattleStats", &BattleEngine::getBattleStats);
    
    // Vector bindings
    register_vector<Unit>("UnitVector");
    register_vector<TerrainCell>("TerrainCellVector");
    register_vector<std::vector<TerrainCell>>("TerrainGrid");
    register_vector<std::string>("StringVector");
}
