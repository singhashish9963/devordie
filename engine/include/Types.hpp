#ifndef TYPES_HPP
#define TYPES_HPP

#include <string>
#include <vector>

namespace BattleSimulator {

struct Position {
    int x;
    int y;
};

struct Stats {
    int health;
    int maxHealth;
    int attack;
    int defense;
    int speed;
};

enum class UnitType {
    WARRIOR,
    ARCHER,
    MAGE
};

enum class ActionType {
    MOVE,
    ATTACK,
    DEFEND,
    ABILITY
};

} // namespace BattleSimulator

#endif // TYPES_HPP
