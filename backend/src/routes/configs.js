import express from 'express'
import { body, validationResult } from 'express-validator'
import Configuration from '../models/Configuration.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// @route   POST /api/configs
// @desc    Save a new configuration
// @access  Private
router.post('/', authMiddleware, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('config').notEmpty().withMessage('Configuration data is required')
], validateRequest, async (req, res) => {
  try {
    const { name, description, config, isPublic, tags } = req.body

    const newConfig = await Configuration.create({
      userId: req.user._id,
      name,
      description,
      config,
      isPublic: isPublic || false,
      tags: tags || []
    })

    res.status(201).json({
      success: true,
      message: 'Configuration saved successfully',
      config: newConfig
    })
  } catch (error) {
    console.error('Save config error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to save configuration'
    })
  }
})

// @route   GET /api/configs
// @desc    Get user's configurations
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const configs = await Configuration.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v')

    res.json({
      success: true,
      count: configs.length,
      configs
    })
  } catch (error) {
    console.error('Get configs error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve configurations'
    })
  }
})

// @route   GET /api/configs/public
// @desc    Get public configurations
// @access  Public (with optional auth)
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const { tags, limit = 20, page = 1 } = req.query

    const query = { isPublic: true }
    if (tags) {
      query.tags = { $in: tags.split(',') }
    }

    const configs = await Configuration.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v')

    const total = await Configuration.countDocuments(query)

    res.json({
      success: true,
      count: configs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      configs
    })
  } catch (error) {
    console.error('Get public configs error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve public configurations'
    })
  }
})

// @route   GET /api/configs/:id
// @desc    Get a specific configuration
// @access  Private/Public (based on isPublic)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id)
      .populate('userId', 'name')

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      })
    }

    // Check access rights
    if (!config.isPublic && (!req.user || config.userId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Get config error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve configuration'
    })
  }
})

// @route   PUT /api/configs/:id
// @desc    Update a configuration
// @access  Private
router.put('/:id', authMiddleware, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
], validateRequest, async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id)

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      })
    }

    // Check ownership
    if (config.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const { name, description, config: configData, isPublic, tags } = req.body

    if (name) config.name = name
    if (description !== undefined) config.description = description
    if (configData) config.config = configData
    if (isPublic !== undefined) config.isPublic = isPublic
    if (tags) config.tags = tags

    await config.save()

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config
    })
  } catch (error) {
    console.error('Update config error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration'
    })
  }
})

// @route   DELETE /api/configs/:id
// @desc    Delete a configuration
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id)

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      })
    }

    // Check ownership
    if (config.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    await config.deleteOne()

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    })
  } catch (error) {
    console.error('Delete config error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete configuration'
    })
  }
})

// @route   POST /api/configs/:id/stats
// @desc    Update configuration statistics
// @access  Private
router.post('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const { result } = req.body // 'win', 'loss', or 'draw'

    const config = await Configuration.findById(req.params.id)

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      })
    }

    // Check ownership
    if (config.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    config.stats.timesUsed += 1
    if (result === 'win') config.stats.wins += 1
    else if (result === 'loss') config.stats.losses += 1
    else if (result === 'draw') config.stats.draws += 1

    await config.save()

    res.json({
      success: true,
      stats: config.stats
    })
  } catch (error) {
    console.error('Update stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update statistics'
    })
  }
})

export default router
