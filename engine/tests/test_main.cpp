#include <iostream>
#include <cassert>
#include "../include/BattleEngine.h"

using namespace BattleSimulator;

void testPositionDistance() {
    Position p1(0, 0);
    Position p2(3, 4);
    assert(std::abs(p1.distanceTo(p2) - 5.0) < 0.001);
    std::cout << "✓ Position distance test passed\n";
}

void testUnitCreation() {
    Unit unit("unit1", "teamA", "soldier");
    assert(unit.id == "unit1");
    assert(unit.team == "teamA");
    assert(unit.isAlive());
    std::cout << "✓ Unit creation test passed\n";
}

void testUnitDamage() {
    Unit unit("unit1", "teamA", "soldier");
    unit.health = 100;
    unit.takeDamage(30);
    assert(unit.health == 70);
    assert(unit.isAlive());
    
    unit.takeDamage(100);
    assert(!unit.isAlive());
    std::cout << "✓ Unit damage test passed\n";
}

void testBattleEngineInitialization() {
    BattleEngine engine(20, 20);
    
    Unit unit1("unit1", "teamA", "soldier");
    unit1.position = Position(5, 5);
    unit1.health = 100;
    unit1.attack = 20;
    
    Unit unit2("unit2", "teamB", "soldier");
    unit2.position = Position(15, 15);
    unit2.health = 100;
    unit2.attack = 20;
    
    engine.addUnit(unit1);
    engine.addUnit(unit2);
    
    assert(engine.initialize());
    assert(engine.getCurrentTick() == 0);
    std::cout << "✓ Battle engine initialization test passed\n";
}

void testSimpleBattle() {
    BattleEngine engine(20, 20, 100);
    
    // Add units
    Unit unit1("unit1", "teamA", "soldier");
    unit1.position = Position(5, 10);
    unit1.health = 50;
    unit1.attack = 30;
    unit1.range = 2;
    
    Unit unit2("unit2", "teamB", "soldier");
    unit2.position = Position(15, 10);
    unit2.health = 50;
    unit2.attack = 30;
    unit2.range = 2;
    
    engine.addUnit(unit1);
    engine.addUnit(unit2);
    
    // Set simple AI: attack closest enemy
    engine.setAICallback("teamA", [](const Unit& self, const BattleState& state) {
        Action action;
        action.type = Action::ATTACK;
        return action;
    });
    
    engine.setAICallback("teamB", [](const Unit& self, const BattleState& state) {
        Action action;
        action.type = Action::ATTACK;
        return action;
    });
    
    engine.run();
    
    assert(engine.isFinished());
    assert(!engine.getWinner().empty());
    std::cout << "✓ Simple battle test passed\n";
    std::cout << "  Winner: " << engine.getWinner() << "\n";
    std::cout << "  Total ticks: " << engine.getCurrentTick() << "\n";
}

void testMovement() {
    BattleEngine engine(20, 20);
    
    Unit unit1("unit1", "teamA", "soldier");
    unit1.position = Position(0, 0);
    unit1.speed = 2;
    
    engine.addUnit(unit1);
    engine.initialize();
    
    // Set AI to move right
    engine.setAICallback("teamA", [](const Unit& self, const BattleState& state) {
        Action action;
        action.type = Action::MOVE;
        action.direction = "right";
        return action;
    });
    
    Position initialPos = engine.getState().units[0].position;
    engine.tick();
    Position newPos = engine.getState().units[0].position;
    
    assert(newPos.x > initialPos.x);
    std::cout << "✓ Movement test passed\n";
}

void testTeamCounting() {
    BattleEngine engine(20, 20);
    
    for (int i = 0; i < 3; i++) {
        Unit unitA("teamA_" + std::to_string(i), "teamA", "soldier");
        unitA.position = Position(i, 0);
        engine.addUnit(unitA);
    }
    
    for (int i = 0; i < 2; i++) {
        Unit unitB("teamB_" + std::to_string(i), "teamB", "soldier");
        unitB.position = Position(i, 19);
        engine.addUnit(unitB);
    }
    
    engine.initialize();
    
    assert(engine.getTeamAliveCount("teamA") == 3);
    assert(engine.getTeamAliveCount("teamB") == 2);
    std::cout << "✓ Team counting test passed\n";
}

int main() {
    std::cout << "Running Battle Simulator Tests...\n\n";
    
    try {
        testPositionDistance();
        testUnitCreation();
        testUnitDamage();
        testBattleEngineInitialization();
        testMovement();
        testTeamCounting();
        testSimpleBattle();
        
        std::cout << "\n✅ All tests passed!\n";
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "\n❌ Test failed: " << e.what() << "\n";
        return 1;
    }
}
