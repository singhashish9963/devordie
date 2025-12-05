#ifndef BATTLE_ENGINE_H
#define BATTLE_ENGINE_H

#include <vector>
#include <string>
#include <memory>
#include <functional>

namespace BattleSimulator {

// Forward declarations
struct Position;
struct Unit;
struct TerrainCell;
class BattleEngine;

// Position structure
struct Position {
    int x;
    int y;
    
    Position() : x(0), y(0) {}
    Position(int x, int y) : x(x), y(y) {}
    
    double distanceTo(const Position& other) const;
    bool operator==(const Position& other) const;
};

// Unit structure
struct Unit {
    std::string id;
    std::string team;
    std::string type;
    Position position;
    
    int health;
    int maxHealth;
    int attack;
    int defense;
    int speed;
    int range;
    
    bool alive;
    int cooldown;
    std::string targetId;
    
    Unit();
    Unit(const std::string& id, const std::string& team, const std::string& type);
    
    bool isAlive() const { return alive && health > 0; }
    void takeDamage(int damage);
    void heal(int amount);
};

// Terrain cell
struct TerrainCell {
    std::string type;
    double moveCost;
    
    TerrainCell() : type("ground"), moveCost(1.0) {}
    TerrainCell(const std::string& t, double cost) : type(t), moveCost(cost) {}
};

// Action structure
struct Action {
    enum Type {
        IDLE,
        MOVE,
        ATTACK
    };
    
    Type type;
    Position targetPosition;
    std::string targetUnitId;
    std::string direction;
    
    Action() : type(IDLE) {}
};

// Battle state
struct BattleState {
    int tick;
    std::vector<Unit> units;
    std::vector<std::vector<TerrainCell>> terrain;
    std::string status;
    std::string winner;
    std::vector<std::string> logs;
    
    BattleState() : tick(0), status("idle") {}
};

// AI Decision callback type
using AIDecisionCallback = std::function<Action(const Unit&, const BattleState&)>;

// Battle Engine class
class BattleEngine {
private:
    BattleState state_;
    int gridWidth_;
    int gridHeight_;
    int maxTicks_;
    
    std::map<std::string, AIDecisionCallback> aiCallbacks_;
    
    // Private helper methods
    void processUnit(Unit& unit);
    void executeAction(Unit& unit, const Action& action);
    void handleMove(Unit& unit, const Action& action);
    void handleAttack(Unit& unit, const Action& action);
    
    Unit* findUnitById(const std::string& id);
    Unit* findClosestEnemy(const Unit& unit);
    std::vector<Unit*> getEnemiesInRange(const Unit& unit, int range);
    std::vector<Unit*> getAlliesInRange(const Unit& unit, int range);
    
    bool checkCollision(const Position& pos, const std::string& excludeUnitId);
    bool checkWinCondition();
    void addLog(const std::string& message);
    
public:
    BattleEngine(int width, int height, int maxTicks = 1000);
    ~BattleEngine();
    
    // Initialization
    void setTerrain(const std::vector<std::vector<TerrainCell>>& terrain);
    void addUnit(const Unit& unit);
    void setAICallback(const std::string& team, AIDecisionCallback callback);
    
    // Simulation control
    bool initialize();
    void tick();
    void run();
    void reset();
    
    // State access
    const BattleState& getState() const { return state_; }
    bool isFinished() const { return state_.status == "finished"; }
    int getCurrentTick() const { return state_.tick; }
    std::string getWinner() const { return state_.winner; }
    
    // Unit queries
    std::vector<Unit> getAliveUnits() const;
    std::vector<Unit> getTeamUnits(const std::string& team) const;
    int getTeamAliveCount(const std::string& team) const;
    
    // Statistics
    struct BattleStats {
        int totalTicks;
        std::string winner;
        int teamAUnitsRemaining;
        int teamBUnitsRemaining;
        int totalDamageDealt;
        std::vector<std::string> logs;
    };
    
    BattleStats getBattleStats() const;
};

} // namespace BattleSimulator

#endif // BATTLE_ENGINE_H
