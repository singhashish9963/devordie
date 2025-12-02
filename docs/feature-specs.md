# Battle Simulator - Feature Specifications

## 1. Logic Builder

### Overview
Visual programming interface for creating unit behavior without writing code.

### Components
- **Condition Blocks**: IF/ELSE logic
- **Action Blocks**: Move, Attack, Defend
- **Variable Blocks**: Health %, Distance, etc.
- **Flow Control**: Loops, sequences

### User Stories
- As a player, I can drag and drop logic blocks to create unit behavior
- As a player, I can save and reuse logic templates
- As a player, I can test my logic before battle

## 2. Battle Grid

### Overview
2D grid-based battlefield where units are placed and battles occur.

### Features
- **Grid Size**: Configurable (default 20x20)
- **Terrain**: Plain, obstacles (future)
- **Unit Placement**: Drag and drop
- **Team Assignment**: Color-coded
- **Fog of War**: Optional

### Interactions
- Click to select unit
- Drag to move unit (setup phase)
- Hover for stats
- Right-click for options

## 3. Simulation Engine

### Overview
C++ engine that runs battle simulations with WebAssembly.

### Capabilities
- **Turn-based**: Each unit acts per turn
- **Stats Calculation**: Damage, defense, etc.
- **Victory Detection**: Last team standing
- **Step Limit**: Prevent infinite battles
- **Deterministic**: Same setup = same result

### Performance
- Target: 1000+ units
- 60 FPS visualization
- < 100ms per turn calculation

## 4. Unit System

### Unit Types
1. **Warrior**
   - High health and defense
   - Melee combat
   - Low range

2. **Archer**
   - Medium health
   - Ranged attacks
   - High damage

3. **Mage**
   - Low health
   - Long range
   - Area effects

### Stats
- Health: 50-200
- Attack: 5-30
- Defense: 0-20
- Speed: 3-10 (tiles per turn)
- Range: 1-5 tiles

### Custom Logic
- Each unit can have unique behavior
- Logic executed each turn
- Access to game state

## 5. User Interface

### Main Screens
1. **Home**: Dashboard, quick start
2. **Unit Manager**: Create/edit units
3. **Logic Builder**: Visual programming
4. **Battle Setup**: Configure match
5. **Battle View**: Watch simulation
6. **Results**: Statistics and replay

### Design Principles
- Intuitive drag-and-drop
- Real-time feedback
- Mobile-friendly (future)
- Accessibility support

## 6. Multiplayer (Future)

### Features
- Asynchronous battles
- Matchmaking by skill
- Tournament brackets
- Live spectating
- Friend challenges

### Implementation
- WebSocket for real-time
- Turn submission queue
- Replay storage
- Rating system (ELO)
