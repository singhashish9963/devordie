#include "Map.hpp"

namespace BattleSimulator {

Map::Map(int width, int height) 
    : width_(width), height_(height) {
    grid_.resize(height_, std::vector<int>(width_, 0));
}

Map::~Map() {
}

int Map::getWidth() const {
    return width_;
}

int Map::getHeight() const {
    return height_;
}

bool Map::isValidPosition(const Position& pos) const {
    return pos.x >= 0 && pos.x < width_ && 
           pos.y >= 0 && pos.y < height_;
}

bool Map::isOccupied(const Position& pos) const {
    if (!isValidPosition(pos)) {
        return true;
    }
    return grid_[pos.y][pos.x] != 0;
}

} // namespace BattleSimulator
