# Battle Simulator Backend

Node.js/Express backend API for the Battle Simulator application.

## Features

- RESTful API for simulation management
- Real-time battle simulation engine
- Configuration validation
- Battle state management
- Error handling and logging
- CORS support for frontend integration

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **JavaScript** - Primary language
- Optional: MongoDB with Mongoose for persistence

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   ├── engine.js    # Simulation engine
│   │   └── simulationService.js
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Data models (if using DB)
│   └── index.js         # Entry point
├── tests/               # Test files
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README.md
```

## Installation

```bash
cd backend
npm install
```

## Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Running

### Development Mode

```bash
npm run dev
```

Server runs on http://localhost:5001 with auto-reload.

### Production Mode

```bash
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Simulations

#### Create Simulation

```
POST /api/simulations
Content-Type: application/json

{
  "gridSize": { "width": 20, "height": 20 },
  "terrain": [...],
  "units": {
    "teamA": [...],
    "teamB": [...]
  },
  "code": {
    "teamA": "function onTick(state) { ... }",
    "teamB": "function onTick(state) { ... }"
  },
  "maxTicks": 1000
}
```

Response:
```json
{
  "success": true,
  "simulationId": "sim_1234567890_abc",
  "message": "Simulation created successfully"
}
```

#### Get All Simulations

```
GET /api/simulations
```

#### Get Simulation State

```
GET /api/simulations/:id
```

#### Start Simulation (Run to Completion)

```
POST /api/simulations/:id/start
```

Runs the entire simulation and returns final results.

#### Step Simulation (Single Tick)

```
POST /api/simulations/:id/step
```

Executes one simulation tick and returns current state.

#### Delete Simulation

```
DELETE /api/simulations/:id
```

#### Validate Configuration

```
POST /api/simulations/validate
Content-Type: application/json

{
  "gridSize": { "width": 20, "height": 20 },
  "units": { "teamA": [...], "teamB": [...] },
  "code": { "teamA": "...", "teamB": "..." }
}
```

Response:
```json
{
  "valid": true,
  "errors": []
}
```

### Configurations

#### Save Configuration

```
POST /api/configs
Content-Type: application/json

{
  "name": "My Configuration",
  "config": { ... }
}
```

#### Get Configuration

```
GET /api/configs/:id
```

#### Get All Configurations

```
GET /api/configs
```

### Battles (War Mode - Future)

```
POST /api/battles
GET /api/battles
GET /api/battles/:id
GET /api/battles/leaderboard
```

## Simulation Engine

The backend includes a JavaScript-based simulation engine that replicates the C++ engine logic:

### Features

- Unit AI execution from user code
- Movement and pathfinding
- Combat calculations
- Collision detection
- Win condition checking
- Battle logging

### Example Usage

```javascript
import { SimulationEngine } from './services/engine.js';

const engine = new SimulationEngine({
  gridSize: { width: 20, height: 20 },
  terrain: [...],
  units: { teamA: [...], teamB: [...] },
  code: { teamA: "...", teamB: "..." },
  maxTicks: 1000
});

// Run full simulation
const result = await engine.runFull();
console.log('Winner:', result.result.winner);

// Or step through
engine.initialize();
while (!engine.isFinished()) {
  const state = engine.tick();
  console.log('Tick:', state.tick);
}
```

## Testing

```bash
npm test
```

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Adding New Routes

1. Create controller in `src/controllers/`
2. Define routes in `src/routes/`
3. Register in `src/index.js`

### Adding New Services

1. Create service in `src/services/`
2. Export functions/classes
3. Import in controllers

## Performance

- Handles 100+ concurrent simulations
- Memory efficient state management
- Auto-cleanup of old simulations
- Configurable rate limiting

## Integration with Frontend

Frontend should connect to backend API:

```javascript
// frontend/src/api/simulation.js
const API_URL = 'http://localhost:5001/api';

export async function createSimulation(config) {
  const response = await fetch(`${API_URL}/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return response.json();
}
```

## Deployment

### Using Node.js

```bash
npm install --production
NODE_ENV=production npm start
```

### Using Docker

```bash
docker build -t battle-simulator-backend .
docker run -p 5001:5001 battle-simulator-backend
```

## License

MIT License
