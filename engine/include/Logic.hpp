#ifndef LOGIC_HPP
#define LOGIC_HPP

#include "Types.hpp"
#include "Unit.hpp"
#include <memory>

namespace BattleSimulator {

class Logic {
public:
    Logic();
    virtual ~Logic();

    virtual ActionType decideAction(const Unit& unit) = 0;
    virtual Position decideTarget(const Unit& unit) = 0;
};

class BasicAI : public Logic {
public:
    ActionType decideAction(const Unit& unit) override;
    Position decideTarget(const Unit& unit) override;
};

} // namespace BattleSimulator

#endif // LOGIC_HPP
