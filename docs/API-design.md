# Battle Simulator - API Design

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user
```json
Request:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "userId": "string",
  "token": "string"
}
```

#### POST /auth/login
Login user
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "userId": "string",
  "token": "string"
}
```

### Units

#### GET /units
Get all units for authenticated user
```json
Response:
{
  "units": [
    {
      "id": "string",
      "name": "string",
      "type": "warrior|archer|mage",
      "stats": {
        "health": "number",
        "attack": "number",
        "defense": "number",
        "speed": "number"
      },
      "logic": {}
    }
  ]
}
```

#### POST /units
Create a new unit
```json
Request:
{
  "name": "string",
  "type": "warrior|archer|mage",
  "stats": {
    "health": "number",
    "attack": "number",
    "defense": "number"
  },
  "logic": {}
}

Response:
{
  "unit": {
    "id": "string",
    "name": "string",
    ...
  }
}
```

#### PUT /units/:id
Update a unit

#### DELETE /units/:id
Delete a unit

### Simulations

#### GET /simulations
Get all simulations for authenticated user

#### POST /simulations
Create a new simulation
```json
Request:
{
  "name": "string",
  "gridSize": {
    "width": "number",
    "height": "number"
  },
  "units": [
    {
      "unitId": "string",
      "position": { "x": "number", "y": "number" },
      "team": "number"
    }
  ]
}

Response:
{
  "simulationId": "string",
  "status": "pending"
}
```

#### POST /simulations/:id/run
Run a simulation
```json
Response:
{
  "status": "running",
  "streamUrl": "/simulations/:id/stream"
}
```

#### GET /simulations/:id/stream
WebSocket endpoint for real-time simulation updates

#### GET /simulations/:id/result
Get simulation results

## Error Responses

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
