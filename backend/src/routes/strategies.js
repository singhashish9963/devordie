import express from 'express';
import Strategy from '../models/Strategy.js';
import { authMiddleware } from '../middleware/auth.js';
import { defaultStrategies } from '../data/defaultStrategies.js';

const router = express.Router();

// @route   GET /api/ai/strategies
// @desc    Get all strategies for the authenticated user plus defaults
// @access  Private
router.get('/strategies', authMiddleware, async (req, res) => {
  try {
    const userStrategies = await Strategy.find({ userId: req.user._id })
      .sort({ lastUsed: -1, createdAt: -1 })
      .select('-__v');

    // Add default strategies with special IDs
    const defaultStrategyObjects = defaultStrategies.map((strategy, index) => ({
      _id: `default-${index}`,
      ...strategy,
      isDefault: true,
      userId: null // No user ownership
    }));

    // Combine: defaults first, then user strategies
    const allStrategies = [...defaultStrategyObjects, ...userStrategies];

    res.json({
      success: true,
      strategies: allStrategies
    });
  } catch (error) {
    console.error('Get strategies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get strategies',
      error: error.message
    });
  }
});

// @route   GET /api/ai/strategies/:id
// @desc    Get a specific strategy
// @access  Private
router.get('/strategies/:id', authMiddleware, async (req, res) => {
  try {
    const strategy = await Strategy.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }

    // Update last used
    strategy.lastUsed = new Date();
    await strategy.save();

    res.json({
      success: true,
      strategy
    });
  } catch (error) {
    console.error('Get strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get strategy',
      error: error.message
    });
  }
});

// @route   POST /api/ai/strategies
// @desc    Create a new strategy
// @access  Private
router.post('/strategies', authMiddleware, async (req, res) => {
  try {
    const { name, description, code, language, tags } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    const strategy = new Strategy({
      userId: req.user._id,
      name,
      description,
      code,
      language: language || 'javascript',
      tags: tags || []
    });

    await strategy.save();

    console.log(`✅ Strategy created: ${name} by ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Strategy created successfully',
      strategy
    });
  } catch (error) {
    console.error('Create strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create strategy',
      error: error.message
    });
  }
});

// @route   PUT /api/ai/strategies/:id
// @desc    Update a strategy
// @access  Private
router.put('/strategies/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, code, language, tags, isPublic } = req.body;

    const strategy = await Strategy.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }

    // Update fields
    if (name) strategy.name = name;
    if (description !== undefined) strategy.description = description;
    if (code) strategy.code = code;
    if (language) strategy.language = language;
    if (tags) strategy.tags = tags;
    if (isPublic !== undefined) strategy.isPublic = isPublic;

    await strategy.save();

    console.log(`✅ Strategy updated: ${strategy.name}`);

    res.json({
      success: true,
      message: 'Strategy updated successfully',
      strategy
    });
  } catch (error) {
    console.error('Update strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update strategy',
      error: error.message
    });
  }
});

// @route   DELETE /api/ai/strategies/:id
// @desc    Delete a strategy
// @access  Private
router.delete('/strategies/:id', authMiddleware, async (req, res) => {
  try {
    const strategy = await Strategy.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }

    console.log(`🗑️ Strategy deleted: ${strategy.name}`);

    res.json({
      success: true,
      message: 'Strategy deleted successfully'
    });
  } catch (error) {
    console.error('Delete strategy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete strategy',
      error: error.message
    });
  }
});

// @route   GET /api/ai/strategies/public/list
// @desc    Get all public strategies
// @access  Public
router.get('/strategies/public/list', async (req, res) => {
  try {
    const strategies = await Strategy.find({ isPublic: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v');

    res.json({
      success: true,
      strategies
    });
  } catch (error) {
    console.error('Get public strategies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get public strategies',
      error: error.message
    });
  }
});

// @route   POST /api/ai/strategies/:id/use
// @desc    Record strategy usage (updates stats)
// @access  Private
router.post('/strategies/:id/use', authMiddleware, async (req, res) => {
  try {
    const { result } = req.body; // 'win', 'loss', 'draw'

    const strategy = await Strategy.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }

    // Update stats
    strategy.stats.totalBattles += 1;
    if (result === 'win') strategy.stats.wins += 1;
    else if (result === 'loss') strategy.stats.losses += 1;
    else if (result === 'draw') strategy.stats.draws += 1;
    
    strategy.lastUsed = new Date();
    await strategy.save();

    res.json({
      success: true,
      message: 'Strategy stats updated',
      stats: strategy.stats
    });
  } catch (error) {
    console.error('Update strategy stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update strategy stats',
      error: error.message
    });
  }
});

export default router;
