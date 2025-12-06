import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache for generated strategies to avoid hitting rate limits
const strategyCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

// Rate limiting - ensure we don't exceed 15 requests per minute
let requestQueue = [];
const MAX_REQUESTS_PER_MINUTE = 12; // Stay under 15 limit for safety
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests
let lastRequestTime = 0;

const STRATEGY_TEMPLATES = {
  aggressive: {
    description: "Rush enemies, prioritize kills, no retreat",
    personality: "fearless attacker",
    priorities: ["enemy_proximity", "low_hp_targets", "quick_kills"]
  },
  defensive: {
    description: "Hold position, use terrain, retreat when needed",
    personality: "cautious defender",
    priorities: ["terrain_advantage", "hp_conservation", "position_holding"]
  },
  balanced: {
    description: "Mix of offense and defense with smart targeting",
    personality: "tactical commander",
    priorities: ["medium_threats", "terrain_awareness", "calculated_risks"]
  },
  sniper: {
    description: "Long-range attacks, avoid close combat",
    personality: "precision marksman",
    priorities: ["optimal_range", "high_value_targets", "kiting"]
  },
  hitAndRun: {
    description: "Quick strikes with constant movement",
    personality: "guerrilla fighter",
    priorities: ["mobility", "isolated_targets", "retreat_timing"]
  },
  terrainMaster: {
    description: "Control advantageous positions",
    personality: "strategic commander",
    priorities: ["high_ground", "defensive_positions", "terrain_control"]
  }
};

// Generate cache key for deduplication
function getCacheKey(options) {
  const { strategy, unitTypes, terrain, customInstructions } = options;
  return `${strategy}-${unitTypes.sort().join(',')}-${terrain.sort().join(',')}-${customInstructions}`;
}

// Clean up old cache entries
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of strategyCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      strategyCache.delete(key);
    }
  }
}

// Rate limiting function
async function waitForRateLimit() {
  const now = Date.now();
  
  // Clean old requests from queue (older than 1 minute)
  requestQueue = requestQueue.filter(time => now - time < 60000);
  
  // Check if we've hit the per-minute limit
  if (requestQueue.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestRequest = requestQueue[0];
    const waitTime = 60000 - (now - oldestRequest);
    
    if (waitTime > 0) {
      console.log(`⏳ Rate limit: waiting ${Math.ceil(waitTime / 1000)}s (${requestQueue.length}/${MAX_REQUESTS_PER_MINUTE} requests in last minute)`);
      await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
    }
  }
  
  // Ensure minimum interval between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Throttling: waiting ${Math.ceil(waitTime / 1000)}s before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Record this request
  lastRequestTime = Date.now();
  requestQueue.push(lastRequestTime);
}

export async function generateBattleCode(options) {
  const {
    strategy = 'balanced',
    unitTypes = ['soldier', 'tank'],
    terrain = ['ground', 'mountain'],
    difficulty = 'medium',
    customInstructions = ''
  } = options;

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return {
      success: false,
      error: 'API key not configured',
      fallbackCode: getFallbackCode(strategy === 'custom' ? 'balanced' : strategy)
    };
  }

  // Clean old cache entries periodically
  if (strategyCache.size > 0) {
    cleanCache();
  }

  // Check cache first
  const cacheKey = getCacheKey(options);
  const cached = strategyCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log('✅ Using cached strategy (age: ' + Math.floor((Date.now() - cached.timestamp) / 60000) + ' min)');
    return {
      success: true,
      code: cached.code,
      strategy: strategy,
      cached: true,
      cacheAge: Date.now() - cached.timestamp,
      metadata: {
        ...cached.metadata,
        cached: true,
        cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000) + 's'
      }
    };
  }

  // Handle custom strategy prompt
  if (strategy === 'custom' && customInstructions) {
    return generateCustomStrategyCode(customInstructions, unitTypes, terrain, difficulty);
  }

  const strategyInfo = STRATEGY_TEMPLATES[strategy];
  if (!strategyInfo) {
    return {
      success: false,
      error: 'Invalid strategy',
      fallbackCode: getFallbackCode('balanced')
    };
  }

  const systemPrompt = `You are an expert JavaScript game developer specializing in battle AI.
Generate JavaScript code for a battle strategy AI that controls units in a tactical battle simulator.

The function should take parameters: myUnits, enemyUnits, terrain, round
The function should return a JavaScript object with the unit decisions.

Important:
- DO NOT use any external libraries
- DO NOT use any imports
- Use ONLY vanilla JavaScript (ES6+ is fine)
- The code must be self-contained
- Return a complete, runnable function

Terrain types and effects:
- 0 (ground): No bonus
- 1 (water): 0.1x speed (very slow)
- 2 (mountain): +10 defense bonus
- 3 (forest): +5 defense bonus
- 4 (road): 1.5x speed
- 5 (swamp): 0.25x speed
- 6 (desert): 0.8x speed
- 7 (fortress): +20 defense bonus

Unit types available: Soldier, Archer, Tank, Drone, Sniper

Generate ONLY the JavaScript code, no explanations, no markdown formatting.`;

  const userPrompt = `Generate ${strategy} strategy code for units: ${unitTypes.join(', ')}
Terrain focus: ${terrain.join(', ')}
Difficulty: ${difficulty}
${customInstructions ? `\nAdditional instructions: ${customInstructions}` : ''}

Prioritize: ${strategyInfo.priorities.join(', ')}

The code should be production-ready and handle edge cases.`;

  try {
    // Apply rate limiting before making API call
    await waitForRateLimit();
    
    console.log('🤖 Calling Gemini API with strategy:', strategy);
    console.log('📊 Cache size:', strategyCache.size, '| Queue size:', requestQueue.length);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500, // Reduced to save quota
      }
    });

    const response = await result.response;
    let generatedCode = response.text();
    
    console.log('✅ Gemini API response received, code length:', generatedCode.length);
    
    // Clean up code (remove markdown formatting if present)
    generatedCode = generatedCode
      .replace(/```javascript\n/g, '')
      .replace(/```js\n/g, '')
      .replace(/```\n/g, '')
      .replace(/```/g, '')
      .trim();

    console.log('✅ Code cleaned, final length:', generatedCode.length);

    // Cache the result for 30 minutes
    const cacheKeyFinal = getCacheKey(options);
    strategyCache.set(cacheKeyFinal, {
      code: generatedCode,
      timestamp: Date.now(),
      metadata: {
        model: "gemini-2.0-flash",
        generatedAt: new Date().toISOString(),
        strategy: strategy
      }
    });
    
    console.log('💾 Strategy cached with key:', cacheKeyFinal.substring(0, 50) + '...');

    return {
      success: true,
      code: generatedCode,
      strategy: strategy,
      cached: false,
      metadata: {
        model: "gemini-2.0-flash",
        generatedAt: new Date().toISOString(),
        cached: false
      }
    };
  } catch (error) {
    console.error('❌ AI Code Generation Error:', error);
    console.error('Error details:', error.message);
    
    // Better error handling
    let userMessage = 'AI generation failed, using fallback code';
    
    if (error.message.includes('429') || error.message.includes('RATE_LIMIT')) {
      userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      console.error('⚠️ Rate limit hit! Queue size:', requestQueue.length);
    } else if (error.message.includes('API_KEY') || error.message.includes('API key')) {
      userMessage = 'Invalid API key. Please check your configuration.';
    } else if (error.message.includes('fetch failed')) {
      userMessage = 'Network error. Please check your internet connection.';
    }
    
    return {
      success: false,
      error: error.message,
      userMessage: userMessage,
      fallbackCode: getFallbackCode(strategy)
    };
  }
}

// Fallback code in case API fails
function getFallbackCode(strategy) {
  const fallbacks = {
    aggressive: `// Aggressive Strategy: Rush enemies
const enemies = state.enemies.filter(e => e.hp > 0);
if (!enemies.length) {
  return { action: 'move', target: {x: 15, y: 10} };
}

// Find weakest enemy
const weakest = enemies.reduce((min, e) => e.hp < min.hp ? e : min);

const distance = Math.abs(weakest.position.x - state.self.position.x) + 
                Math.abs(weakest.position.y - state.self.position.y);

// Attack if in range
if (distance <= state.self.range) {
  return { action: 'attack', target: weakest.position };
}

// Chase the weakest
return { action: 'move', target: weakest.position };`,

    defensive: `// Defensive Strategy: Hold position, use terrain
const homeBase = state.self.startPosition || {x: 2, y: 10};
const enemies = state.enemies.filter(e => e.hp > 0);

// Retreat if low HP
if (state.self.hp < state.self.maxHp * 0.3) {
  return { action: 'move', target: homeBase };
}

// Attack nearby enemies
const nearbyEnemy = enemies.find(e => {
  const dist = Math.abs(e.position.x - state.self.position.x) + 
               Math.abs(e.position.y - state.self.position.y);
  return dist <= state.self.range;
});

if (nearbyEnemy) {
  return { action: 'attack', target: nearbyEnemy.position };
}

// Stay near home
const distFromHome = Math.abs(state.self.position.x - homeBase.x) + 
                     Math.abs(state.self.position.y - homeBase.y);

if (distFromHome > 3) {
  return { action: 'move', target: homeBase };
}

return { action: 'move', target: state.self.position };`,

    balanced: `// Balanced Strategy: Smart targeting
const enemies = state.enemies.filter(e => e.hp > 0);
if (!enemies.length) {
  return { action: 'move', target: {x: 10, y: 10} };
}

// Retreat if critical HP
if (state.self.hp < state.self.maxHp * 0.25) {
  const awayX = state.self.position.x - (enemies[0].position.x - state.self.position.x);
  const awayY = state.self.position.y - (enemies[0].position.y - state.self.position.y);
  return { action: 'move', target: {x: awayX, y: awayY} };
}

// Find nearest enemy
const nearest = enemies.sort((a, b) => {
  const distA = Math.abs(a.position.x - state.self.position.x) + 
                Math.abs(a.position.y - state.self.position.y);
  const distB = Math.abs(b.position.x - state.self.position.x) + 
                Math.abs(b.position.y - state.self.position.y);
  return distA - distB;
})[0];

const dist = Math.abs(nearest.position.x - state.self.position.x) + 
             Math.abs(nearest.position.y - state.self.position.y);

// Attack if in range and healthy
if (dist <= state.self.range && state.self.hp > state.self.maxHp * 0.4) {
  return { action: 'attack', target: nearest.position };
}

// Move toward target
return { action: 'move', target: nearest.position };`,

    sniper: `// Sniper Strategy: Long-range, avoid close combat
const enemies = state.enemies.filter(e => e.hp > 0);
if (!enemies.length) {
  return { action: 'move', target: {x: 10, y: 10} };
}

// Target weakest or closest
const target = enemies.sort((a, b) => a.hp - b.hp)[0];
const dist = Math.abs(target.position.x - state.self.position.x) + 
             Math.abs(target.position.y - state.self.position.y);
const optimalRange = state.self.range * 0.8;

// Too close? Back away
if (dist < optimalRange - 1) {
  const awayX = state.self.position.x + (state.self.position.x - target.position.x);
  const awayY = state.self.position.y + (state.self.position.y - target.position.y);
  return { action: 'move', target: {x: awayX, y: awayY} };
}

// Perfect range? Attack
if (dist <= state.self.range) {
  return { action: 'attack', target: target.position };
}

// Move closer to optimal range
const moveX = state.self.position.x + Math.sign(target.position.x - state.self.position.x);
const moveY = state.self.position.y + Math.sign(target.position.y - state.self.position.y);
return { action: 'move', target: {x: moveX, y: moveY} };`,

    hitAndRun: `// Hit-and-Run: Quick strikes, constant movement
const enemies = state.enemies.filter(e => e.hp > 0);
if (!enemies.length) {
  return { action: 'move', target: {x: 10, y: 10} };
}

// Find isolated enemy
const isolated = enemies.find(e => {
  const nearbyAllies = enemies.filter(ally => {
    if (ally === e) return false;
    const dist = Math.abs(ally.position.x - e.position.x) + 
                 Math.abs(ally.position.y - e.position.y);
    return dist < 3;
  }).length;
  return nearbyAllies === 0;
}) || enemies[0];

const dist = Math.abs(isolated.position.x - state.self.position.x) + 
             Math.abs(isolated.position.y - state.self.position.y);

// Attack if in range
if (dist <= state.self.range && state.tick % 3 === 0) {
  return { action: 'attack', target: isolated.position };
}

// Move to flank position
const flankX = isolated.position.x + (state.tick % 2 === 0 ? 2 : -2);
const flankY = isolated.position.y + (state.tick % 2 === 0 ? -2 : 2);
return { action: 'move', target: {x: flankX, y: flankY} };`,

    terrainMaster: `// Terrain Master: Control high ground
const enemies = state.enemies.filter(e => e.hp > 0);
const advantageTerrain = [2, 3, 7]; // mountain, forest, fortress

// Check current terrain
const currentTerrain = state.terrain[state.self.position.y][state.self.position.x];
const onGoodTerrain = advantageTerrain.includes(currentTerrain);

// If not on good terrain, find one
if (!onGoodTerrain) {
  for (let y = 0; y < state.terrain.length; y++) {
    for (let x = 0; x < state.terrain[y].length; x++) {
      if (advantageTerrain.includes(state.terrain[y][x])) {
        const dist = Math.abs(x - state.self.position.x) + 
                     Math.abs(y - state.self.position.y);
        if (dist < 5) {
          return { action: 'move', target: {x, y} };
        }
      }
    }
  }
}

// On good terrain: attack nearest enemy
if (enemies.length && onGoodTerrain) {
  const nearest = enemies.sort((a, b) => {
    const distA = Math.abs(a.position.x - state.self.position.x) + 
                  Math.abs(a.position.y - state.self.position.y);
    const distB = Math.abs(b.position.x - state.self.position.x) + 
                  Math.abs(b.position.y - state.self.position.y);
    return distA - distB;
  })[0];
  
  const dist = Math.abs(nearest.position.x - state.self.position.x) + 
               Math.abs(nearest.position.y - state.self.position.y);
  
  if (dist <= state.self.range) {
    return { action: 'attack', target: nearest.position };
  }
}

// Hold position
return { action: 'move', target: state.self.position };`
  };

  return fallbacks[strategy] || fallbacks.balanced;
}

// Generate code from custom user prompt
async function generateCustomStrategyCode(userPrompt, unitTypes, terrain, difficulty) {
  const systemPrompt = `You are an expert battle AI programmer. Generate JavaScript code for a tactical battle simulation based on the user's custom strategy description.

The code must:
- Use the provided game state (state.self, state.enemies, state.terrain)
- Return an object: { action: 'move' | 'attack', target: {x, y} }
- Be efficient and bug-free
- Follow the user's strategy requirements exactly

Generate production-ready JavaScript code that implements this exact strategy. Handle edge cases and ensure the code is robust.`;

  try {
    // Apply rate limiting
    await waitForRateLimit();
    
    console.log('🎨 Generating custom strategy with Gemini Flash...');
    console.log('📝 User prompt:', userPrompt.substring(0, 80) + '...');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.8, // Higher temperature for more creative custom strategies
        maxOutputTokens: 1500,
      }
    });

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\nUser's Strategy: " + userPrompt }] }
      ]
    });

    const response = await result.response;
    let generatedCode = response.text();
    
    console.log('✅ Custom strategy generated successfully');
    
    // Clean up code
    generatedCode = generatedCode
      .replace(/```javascript\n/g, '')
      .replace(/```js\n/g, '')
      .replace(/```\n/g, '')
      .replace(/```/g, '')
      .trim();

    // Cache custom strategies too
    const cacheKey = `custom-${userPrompt}`;
    strategyCache.set(cacheKey, {
      code: generatedCode,
      timestamp: Date.now(),
      metadata: {
        model: "gemini-2.0-flash",
        generatedAt: new Date().toISOString(),
        customPrompt: userPrompt
      }
    });

    return {
      success: true,
      code: generatedCode,
      strategy: 'custom',
      cached: false,
      metadata: {
        model: "gemini-2.0-flash",
        generatedAt: new Date().toISOString(),
        customPrompt: userPrompt
      }
    };
  } catch (error) {
    console.error('❌ Custom AI Code Generation Error:', error.message);
    
    // Check for specific error types
    if (error.message.includes('fetch failed')) {
      console.error('❌ Network error: Cannot reach Google Gemini API');
    } else if (error.message.includes('429') || error.message.includes('RATE_LIMIT')) {
      console.error('❌ Rate limit exceeded');
      console.error('⏳ Please wait before trying again');
    } else if (error.message.includes('API key')) {
      console.error('❌ Invalid API key');
    }
    
    console.log('📦 Using fallback code instead');
    
    return {
      success: false,
      error: error.message,
      userMessage: error.message.includes('429') 
        ? 'Rate limit exceeded. Please wait a minute and try again.'
        : 'AI generation failed. Using fallback code.',
      fallbackCode: getFallbackCode('balanced')
    };
  }
}

export { STRATEGY_TEMPLATES };
