#ifndef MAP_HPP
#define MAP_HPP

#include "Types.hpp"
#include <vector>

namespace BattleSimulator {

class Map {
public:
    Map(int width, int height);
    ~Map();

    int getWidth() const;
    int getHeight() const;
    bool isValidPosition(const Position& pos) const;
    bool isOccupied(const Position& pos) const;

private:
    int width_;
    int height_;
    std::vector<std::vector<int>> grid_;
};

} // namespace BattleSimulator

#endif // MAP_HPP
