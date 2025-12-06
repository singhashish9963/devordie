console.log('\n🔍 Quick WASM Check\n');
console.log('Environment variable USE_WASM:', process.env.USE_WASM);

import('./src/services/simulationService.js').then(module => {
    const { simulationService } = module;
    
    console.log('\n📝 Accessing useWASM property (triggers lazy initialization)...');
    const isUsingWASM = simulationService.useWASM;
    
    console.log('\n📊 Result:');
    console.log('  WASM Enabled:', isUsingWASM);
    console.log('  Engine Type:', isUsingWASM ? 'WASM C++ ⚡' : 'JavaScript 📜');
    
    if (isUsingWASM) {
        console.log('\n✅ SUCCESS: WASM engine is configured and ready!');
        console.log('   Performance: 10-100x faster for large battles');
    } else {
        console.log('\n❌ JavaScript engine active');
        console.log('   To enable WASM: Set USE_WASM=true in .env file');
    }
    
    console.log('');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
