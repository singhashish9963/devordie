import express from 'express';
import { generateBattleCode, STRATEGY_TEMPLATES } from '../services/aiCodeGenerator.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/ai/generate-code
// @desc    Generate AI battle strategy code using Gemini Flash
// @access  Private
router.post('/generate-code', authMiddleware, async (req, res) => {
  try {
    const {
      strategy,
      unitTypes,
      terrain,
      difficulty,
      customInstructions
    } = req.body;

    // Validate inputs
    if (!strategy) {
      return res.status(400).json({
        success: false,
        message: 'Strategy type is required'
      });
    }

    if (strategy === 'custom' && !customInstructions) {
      return res.status(400).json({
        success: false,
        message: 'Custom instructions are required for custom strategy'
      });
    }

    if (strategy !== 'custom' && !STRATEGY_TEMPLATES[strategy]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid strategy type'
      });
    }

    console.log(`🤖 Generating ${strategy === 'custom' ? 'custom' : strategy} strategy code with Gemini Flash...`);
    if (strategy === 'custom') {
      console.log(`📝 Custom prompt: "${customInstructions.substring(0, 100)}..."`);
    }

    const result = await generateBattleCode({
      strategy,
      unitTypes: unitTypes || ['soldier'],
      terrain: terrain || ['ground'],
      difficulty: difficulty || 'medium',
      customInstructions
    });

    if (result.success) {
      console.log(`✅ Code generated successfully using ${result.metadata.model}`);
      res.json({
        success: true,
        code: result.code,
        strategy: result.strategy,
        cached: result.cached || false,
        cacheAge: result.cacheAge || 0,
        metadata: result.metadata
      });
    } else {
      console.warn('⚠️ AI generation failed, using fallback code');
      res.status(200).json({
        success: true,
        code: result.fallbackCode,
        strategy: strategy,
        usingFallback: true,
        metadata: {
          model: 'fallback',
          generatedAt: new Date().toISOString()
        },
        warning: result.userMessage || 'Using fallback code due to AI service error'
      });
    }
  } catch (error) {
    console.error('❌ AI generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate code',
      error: error.message
    });
  }
});

// @route   GET /api/ai/strategies
// @desc    Get available strategy templates
// @access  Public
router.get('/strategies', (req, res) => {
  res.json({
    success: true,
    strategies: Object.entries(STRATEGY_TEMPLATES).map(([key, value]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      description: value.description,
      personality: value.personality,
      priorities: value.priorities
    }))
  });
});

// @route   POST /api/ai/validate-code
// @desc    Validate generated code syntax
// @access  Private
router.post('/validate-code', authMiddleware, (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    // Basic syntax validation
    try {
      new Function('state', code);
      res.json({
        success: true,
        valid: true,
        message: 'Code syntax is valid'
      });
    } catch (syntaxError) {
      res.json({
        success: true,
        valid: false,
        message: 'Syntax error in code',
        error: syntaxError.message
      });
    }
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate code'
    });
  }
});

export default router;
