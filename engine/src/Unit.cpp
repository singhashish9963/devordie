#include "Unit.hpp"

namespace BattleSimulator {

Unit::Unit(int id, const std::string& name, UnitType type, const Position& pos)
    : id_(id), name_(name), type_(type), position_(pos) {
    
    // Initialize stats based on unit type
    stats_.maxHealth = 100;
    stats_.health = 100;
    stats_.attack = 10;
    stats_.defense = 5;
    stats_.speed = 5;
}

Unit::~Unit() {
}

int Unit::getId() const {
    return id_;
}

std::string Unit::getName() const {
    return name_;
}

UnitType Unit::getType() const {
    return type_;
}

Position Unit::getPosition() const {
    return position_;
}

Stats Unit::getStats() const {
    return stats_;
}

void Unit::setPosition(const Position& pos) {
    position_ = pos;
}

void Unit::takeDamage(int damage) {
    int actualDamage = damage - stats_.defense;
    if (actualDamage > 0) {
        stats_.health -= actualDamage;
        if (stats_.health < 0) {
            stats_.health = 0;
        }
    }
}

void Unit::heal(int amount) {
    stats_.health += amount;
    if (stats_.health > stats_.maxHealth) {
        stats_.health = stats_.maxHealth;
    }
}

bool Unit::isAlive() const {
    return stats_.health > 0;
}

} // namespace BattleSimulator
