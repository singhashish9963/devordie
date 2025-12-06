// Simple test to see what the WASM module actually exports
const wasmModule = require('./wasm/battle_sim.js');

console.log('Module type:', typeof wasmModule);
console.log('Module is function?:', typeof wasmModule === 'function');
console.log('Module keys:', Object.keys(wasmModule));

if (typeof wasmModule === 'function') {
  console.log('✅ Module exports a function directly');
  wasmModule().then(module => {
    console.log('✅ WASM initialized');
    console.log('Module keys:', Object.keys(module));
    console.log('BattleEngine:', typeof module.BattleEngine);
  }).catch(err => {
    console.error('❌ Error:', err);
  });
} else {
  console.log('❌ Module does not export a function');
}
