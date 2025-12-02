#include "Logic.hpp"

namespace BattleSimulator {

Logic::Logic() {
}

Logic::~Logic() {
}

BasicAI::BasicAI() {
}

ActionType BasicAI::decideAction(const Unit& unit) {
    // Basic AI: attack if enemy nearby, otherwise move
    return ActionType::ATTACK;
}

Position BasicAI::decideTarget(const Unit& unit) {
    // Basic AI: move towards center or nearest enemy
    Position current = unit.getPosition();
    return Position{current.x + 1, current.y};
}

} // namespace BattleSimulator
