#include "BattleEngine.h"
#include <cmath>
#include <algorithm>
#include <sstream>

namespace BattleSimulator {

// Position implementation
double Position::distanceTo(const Position& other) const {
    int dx = other.x - x;
    int dy = other.y - y;
    return std::sqrt(dx * dx + dy * dy);
}

bool Position::operator==(const Position& other) const {
    return x == other.x && y == other.y;
}

// Unit implementation
Unit::Unit() 
    : id(""), team(""), type(""), position(0, 0),
      health(100), maxHealth(100), attack(10), defense(5),
      speed(1), range(1), alive(true), cooldown(0), targetId("") {}

Unit::Unit(const std::string& id, const std::string& team, const std::string& type)
    : id(id), team(team), type(type), position(0, 0),
      health(100), maxHealth(100), attack(10), defense(5),
      speed(1), range(1), alive(true), cooldown(0), targetId("") {}

// BattleEngine implementation
BattleEngine::BattleEngine(int width, int height, int maxTicks)
    : gridWidth_(width), gridHeight_(height), maxTicks_(maxTicks) {
    state_.terrain.resize(height, std::vector<TerrainCell>(width));
}

BattleEngine::~BattleEngine() {}

void BattleEngine::setTerrain(const std::vector<std::vector<TerrainCell>>& terrain) {
    state_.terrain = terrain;
}

void BattleEngine::addUnit(const Unit& unit) {
    state_.units.push_back(unit);
}

void BattleEngine::setAICallback(const std::string& team, AIDecisionCallback callback) {
    aiCallbacks_[team] = callback;
}

bool BattleEngine::initialize() {
    state_.status = "initialized";
    state_.tick = 0;
    state_.winner = "";
    state_.logs.clear();
    
    addLog("Battle initialized");
    return true;
}

void BattleEngine::tick() {
    if (state_.status != "running" && state_.status != "initialized") {
        return;
    }
    
    state_.status = "running";
    state_.tick++;
    
    // Check win condition
    if (checkWinCondition()) {
        state_.status = "finished";
        return;
    }
    
    // Check max ticks
    if (state_.tick >= maxTicks_) {
        state_.status = "finished";
        state_.winner = "draw";
        addLog("Battle ended in draw - max ticks reached");
        return;
    }
    
    // Process each alive unit
    for (auto& unit : state_.units) {
        if (unit.isAlive()) {
            processUnit(unit);
        }
    }
    
    // Update cooldowns
    for (auto& unit : state_.units) {
        if (unit.cooldown > 0) {
            unit.cooldown--;
        }
    }
}

void BattleEngine::run() {
    initialize();
    
    while (!isFinished()) {
        tick();
    }
}

void BattleEngine::reset() {
    state_ = BattleState();
    state_.terrain.resize(gridHeight_, std::vector<TerrainCell>(gridWidth_));
}

void BattleEngine::processUnit(Unit& unit) {
    if (unit.cooldown > 0) return;
    
    // Get AI decision
    Action action;
    auto it = aiCallbacks_.find(unit.team);
    if (it != aiCallbacks_.end()) {
        action = it->second(unit, state_);
    }
    
    // Execute action
    executeAction(unit, action);
}

void BattleEngine::executeAction(Unit& unit, const Action& action) {
    switch (action.type) {
        case Action::MOVE:
            handleMove(unit, action);
            break;
        case Action::ATTACK:
            handleAttack(unit, action);
            break;
        case Action::IDLE:
        default:
            break;
    }
}

void BattleEngine::handleMove(Unit& unit, const Action& action) {
    Position newPos = unit.position;
    
    if (action.targetPosition.x >= 0 && action.targetPosition.y >= 0) {
        // Move towards target
        int dx = action.targetPosition.x - unit.position.x;
        int dy = action.targetPosition.y - unit.position.y;
        double distance = std::sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            newPos.x = unit.position.x + static_cast<int>((dx / distance) * unit.speed);
            newPos.y = unit.position.y + static_cast<int>((dy / distance) * unit.speed);
        }
    } else if (!action.direction.empty()) {
        // Move in direction
        if (action.direction == "up") newPos.y -= unit.speed;
        else if (action.direction == "down") newPos.y += unit.speed;
        else if (action.direction == "left") newPos.x -= unit.speed;
        else if (action.direction == "right") newPos.x += unit.speed;
        else if (action.direction == "forward") {
            newPos.x += (unit.team == "teamA") ? unit.speed : -unit.speed;
        }
    }
    
    // Clamp to grid bounds
    newPos.x = std::max(0, std::min(gridWidth_ - 1, newPos.x));
    newPos.y = std::max(0, std::min(gridHeight_ - 1, newPos.y));
    
    // Check collision
    if (!checkCollision(newPos, unit.id)) {
        unit.position = newPos;
    }
}

void BattleEngine::handleAttack(Unit& unit, const Action& action) {
    if (unit.cooldown > 0) return;
    
    Unit* target = nullptr;
    
    if (!action.targetUnitId.empty()) {
        target = findUnitById(action.targetUnitId);
    } else {
        target = findClosestEnemy(unit);
    }
    
    if (target && target->isAlive()) {
        double distance = unit.position.distanceTo(target->position);
        
        if (distance <= unit.range) {
            // Calculate damage
            int baseDamage = unit.attack;
            int damageReduction = static_cast<int>(target->defense * 0.5);
            int finalDamage = std::max(1, baseDamage - damageReduction);
            
            target->takeDamage(finalDamage);
            unit.cooldown = 3;
            
            std::ostringstream log;
            log << unit.team << " unit attacked " << target->team 
                << " unit for " << finalDamage << " damage";
            addLog(log.str());
            
            if (!target->isAlive()) {
                std::ostringstream elimLog;
                elimLog << target->team << " unit eliminated!";
                addLog(elimLog.str());
            }
        }
    }
}

Unit* BattleEngine::findUnitById(const std::string& id) {
    for (auto& unit : state_.units) {
        if (unit.id == id && unit.isAlive()) {
            return &unit;
        }
    }
    return nullptr;
}

Unit* BattleEngine::findClosestEnemy(const Unit& unit) {
    Unit* closest = nullptr;
    double minDistance = std::numeric_limits<double>::max();
    
    for (auto& enemy : state_.units) {
        if (enemy.isAlive() && enemy.team != unit.team) {
            double distance = unit.position.distanceTo(enemy.position);
            if (distance < minDistance) {
                minDistance = distance;
                closest = &enemy;
            }
        }
    }
    
    return closest;
}

std::vector<Unit*> BattleEngine::getEnemiesInRange(const Unit& unit, int range) {
    std::vector<Unit*> enemies;
    
    for (auto& enemy : state_.units) {
        if (enemy.isAlive() && enemy.team != unit.team) {
            double distance = unit.position.distanceTo(enemy.position);
            if (distance <= range) {
                enemies.push_back(&enemy);
            }
        }
    }
    
    return enemies;
}

std::vector<Unit*> BattleEngine::getAlliesInRange(const Unit& unit, int range) {
    std::vector<Unit*> allies;
    
    for (auto& ally : state_.units) {
        if (ally.isAlive() && ally.team == unit.team && ally.id != unit.id) {
            double distance = unit.position.distanceTo(ally.position);
            if (distance <= range) {
                allies.push_back(&ally);
            }
        }
    }
    
    return allies;
}

bool BattleEngine::checkCollision(const Position& pos, const std::string& excludeUnitId) {
    for (const auto& unit : state_.units) {
        if (unit.isAlive() && unit.id != excludeUnitId && unit.position == pos) {
            return true;
        }
    }
    return false;
}

bool BattleEngine::checkWinCondition() {
    int teamAAlive = getTeamAliveCount("teamA");
    int teamBAlive = getTeamAliveCount("teamB");
    
    if (teamAAlive == 0 && teamBAlive == 0) {
        state_.winner = "draw";
        addLog("Battle ended in draw - all units eliminated");
        return true;
    } else if (teamAAlive == 0) {
        state_.winner = "teamB";
        addLog("Team B wins!");
        return true;
    } else if (teamBAlive == 0) {
        state_.winner = "teamA";
        addLog("Team A wins!");
        return true;
    }
    
    return false;
}

void BattleEngine::addLog(const std::string& message) {
    std::ostringstream log;
    log << "[Tick " << state_.tick << "] " << message;
    state_.logs.push_back(log.str());
    
    // Keep only last 100 logs
    if (state_.logs.size() > 100) {
        state_.logs.erase(state_.logs.begin());
    }
}

std::vector<Unit> BattleEngine::getAliveUnits() const {
    std::vector<Unit> alive;
    for (const auto& unit : state_.units) {
        if (unit.isAlive()) {
            alive.push_back(unit);
        }
    }
    return alive;
}

std::vector<Unit> BattleEngine::getTeamUnits(const std::string& team) const {
    std::vector<Unit> teamUnits;
    for (const auto& unit : state_.units) {
        if (unit.team == team) {
            teamUnits.push_back(unit);
        }
    }
    return teamUnits;
}

int BattleEngine::getTeamAliveCount(const std::string& team) const {
    int count = 0;
    for (const auto& unit : state_.units) {
        if (unit.team == team && unit.isAlive()) {
            count++;
        }
    }
    return count;
}

BattleEngine::BattleStats BattleEngine::getBattleStats() const {
    BattleStats stats;
    stats.totalTicks = state_.tick;
    stats.winner = state_.winner;
    stats.teamAUnitsRemaining = getTeamAliveCount("teamA");
    stats.teamBUnitsRemaining = getTeamAliveCount("teamB");
    stats.totalDamageDealt = 0; // Could track this during battle
    stats.logs = state_.logs;
    return stats;
}

} // namespace BattleSimulator
