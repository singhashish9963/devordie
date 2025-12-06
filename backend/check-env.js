import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Environment Variable Check:\n');
console.log('USE_WASM value:', process.env.USE_WASM);
console.log('USE_WASM type:', typeof process.env.USE_WASM);
console.log('USE_WASM === "true":', process.env.USE_WASM === 'true');
console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('WASM')));
console.log('\nWASM evaluation:', process.env.USE_WASM === 'true' ? 'WILL USE WASM ✅' : 'WILL USE JS ❌');
