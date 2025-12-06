import dotenv from 'dotenv';
dotenv.config();

import { simulationService } from './src/services/simulationService.js';

console.log('\n✅ Testing WASM Engine Loading\n');

// Create a simple simulation to trigger the lazy initialization
const config = {
  gridSize: { width: 20, height: 20 },
  terrain: Array(20).fill(null).map(() => Array(20).fill(0)),
  units: {
    teamA: [{ 
      type: 'soldier', 
      position: { x: 2, y: 5 }, 
      hp: 100, 
      maxHp: 100, 
      attack: 15, 
      defense: 5, 
      range: 1, 
      speed: 3 
    }],
    teamB: [{ 
      type: 'soldier', 
      position: { x: 17, y: 5 }, 
      hp: 100, 
      maxHp: 100, 
      attack: 15, 
      defense: 5, 
      range: 1, 
      speed: 3 
    }]
  },
  code: {
    teamA: 'return { action: "move", target: { x: 15, y: 10 } };',
    teamB: 'return { action: "move", target: { x: 5, y: 10 } };'
  },
  maxTicks: 100
};

console.log('Creating simulation...');
const result = simulationService.createSimulation(config);

console.log('\n📊 Result:');
console.log('  Success:', result.success);
console.log('  Simulation ID:', result.simulationId);
console.log('  Engine Type:', result.engine || 'not specified');
console.log('\n✅ Test complete!\n');
