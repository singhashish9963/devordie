#ifndef UNIT_HPP
#define UNIT_HPP

#include "Types.hpp"
#include <string>

namespace BattleSimulator {

class Unit {
public:
    Unit(int id, const std::string& name, UnitType type, const Position& pos);
    ~Unit();

    int getId() const;
    std::string getName() const;
    UnitType getType() const;
    Position getPosition() const;
    Stats getStats() const;

    void setPosition(const Position& pos);
    void takeDamage(int damage);
    void heal(int amount);
    bool isAlive() const;

private:
    int id_;
    std::string name_;
    UnitType type_;
    Position position_;
    Stats stats_;
};

} // namespace BattleSimulator

#endif // UNIT_HPP
