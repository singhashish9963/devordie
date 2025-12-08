import express from 'express';
import Battle from '../models/Battle.js';
import { authMiddleware } from '../middleware/auth.js';
import BattleService from '../services/battleService.js';
import { io } from '../index.js';

const router = express.Router();

// @route   POST /api/battles/create
// @desc    Create a new battle room
// @access  Private
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { terrain, gridSize, maxTurns, victoryCondition } = req.body;

    // Generate unique battle code
    let battleCode;
    let codeExists = true;
    
    while (codeExists) {
      battleCode = Battle.generateBattleCode();
      const existing = await Battle.findOne({ battleCode });
      codeExists = !!existing;
    }

    // Create battle with player1 as host
    const battle = await Battle.create({
      battleCode,
      configuration: {
        terrain: terrain || Array(20).fill(null).map(() => Array(20).fill(0)),
        gridSize: gridSize || { width: 20, height: 20 },
        maxTurns: maxTurns || 1000,
        victoryCondition: victoryCondition || 'elimination',
        unitBudget: 1000,
        maxUnits: 10
      },
      player1: {
        userId: req.user._id,
        username: req.user.name,
        units: [],
        aiCode: null,
        submitted: false,
        side: 'left'
      },
      player2: {
        userId: null,
        username: null,
        units: [],
        aiCode: null,
        submitted: false,
        side: 'right'
      },
      status: 'waiting'
    });

    console.log(`✅ Battle created: ${battleCode} by ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Battle room created',
      battle: {
        id: battle._id,
        battleCode: battle.battleCode,
        status: battle.status,
        configuration: battle.configuration,
        player1: {
          username: battle.player1.username,
          side: battle.player1.side
        },
        expiresAt: battle.expiresAt
      }
    });
  } catch (error) {
    console.error('Create battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create battle room',
      error: error.message
    });
  }
});

// @route   POST /api/battles/join/:battleCode
// @desc    Join an existing battle
// @access  Private
router.post('/join/:battleCode', authMiddleware, async (req, res) => {
  try {
    const { battleCode } = req.params;

    const battle = await Battle.findOne({ battleCode }).populate('player1.userId', 'name email');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Battle is not open for joining'
      });
    }

    if (battle.player1.userId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join your own battle'
      });
    }

    if (battle.player2.userId) {
      return res.status(400).json({
        success: false,
        message: 'Battle already has two players'
      });
    }

    // Add player2
    battle.player2.userId = req.user._id;
    battle.player2.username = req.user.name;
    battle.status = 'ready';
    
    await battle.save();

    console.log(`✅ ${req.user.name} joined battle: ${battleCode}`);

    res.json({
      success: true,
      message: 'Successfully joined battle',
      battle: {
        id: battle._id,
        battleCode: battle.battleCode,
        status: battle.status,
        configuration: battle.configuration,
        player1: {
          username: battle.player1.username,
          side: battle.player1.side
        },
        player2: {
          username: battle.player2.username,
          side: battle.player2.side
        }
      }
    });
  } catch (error) {
    console.error('Join battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join battle',
      error: error.message
    });
  }
});

// @route   POST /api/battles/:battleId/submit
// @desc    Submit units and AI code
// @access  Private
router.post('/:battleId/submit', authMiddleware, async (req, res) => {
  try {
    const { battleId } = req.params;
    const { units, aiCode } = req.body;

    if (!units || !aiCode) {
      return res.status(400).json({
        success: false,
        message: 'Units and AI code are required'
      });
    }

    const battle = await Battle.findById(battleId);

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    const playerRole = battle.getPlayerRole(req.user._id);

    if (!playerRole) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this battle'
      });
    }

    if (battle.status === 'in_progress' || battle.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Battle has already started or completed'
      });
    }

    // Validate units
    const validation = battle.validateUnits(units, battle.configuration.unitBudget);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Process units with positions based on side
    const processedUnits = units.map(unit => {
      const stats = Battle.getUnitStats(unit.type);
      return {
        type: unit.type,
        position: unit.position,
        hp: stats.hp,
        maxHp: stats.hp,
        attack: stats.attack,
        defense: stats.defense,
        range: stats.range,
        speed: stats.speed
      };
    });

    // Update player setup
    battle[playerRole].units = processedUnits;
    battle[playerRole].aiCode = aiCode;
    battle[playerRole].submitted = true;

    await battle.save();

    console.log(`✅ ${playerRole} submitted setup for battle: ${battle.battleCode}`);

    res.json({
      success: true,
      message: 'Setup submitted successfully',
      battle: {
        id: battle._id,
        battleCode: battle.battleCode,
        status: battle.status,
        player1Submitted: battle.player1.submitted,
        player2Submitted: battle.player2.submitted,
        readyToStart: battle.isReadyToStart()
      }
    });
  } catch (error) {
    console.error('Submit setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit setup',
      error: error.message
    });
  }
});

// @route   GET /api/battles/:battleId
// @desc    Get battle details
// @access  Private
router.get('/:battleId', authMiddleware, async (req, res) => {
  try {
    const { battleId } = req.params;
    
    console.log('GET /api/war/:battleId called with ID:', battleId);
    console.log('Authenticated user:', req.user);

    const battle = await Battle.findById(battleId)
      .populate('player1.userId', 'name email')
      .populate('player2.userId', 'name email');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    const playerRole = battle.getPlayerRole(req.user._id);
    
    console.log('=== GET BATTLE DEBUG ===');
    console.log('req.user._id:', req.user._id);
    console.log('req.user._id type:', typeof req.user._id);
    console.log('battle.player1.userId:', battle.player1.userId);
    console.log('battle.player1.userId type:', typeof battle.player1.userId);
    console.log('battle.player2.userId:', battle.player2.userId);
    console.log('battle.player2.userId type:', typeof battle.player2.userId);
    console.log('playerRole result:', playerRole);
    console.log('======================');

    // Hide opponent's AI code until battle is completed
    const battleData = {
      id: battle._id,
      battleCode: battle.battleCode,
      status: battle.status,
      configuration: battle.configuration,
      player1: {
        username: battle.player1.username,
        side: battle.player1.side,
        units: battle.player1.units,
        submitted: battle.player1.submitted,
        aiCode: (playerRole === 'player1' || battle.status === 'completed') ? battle.player1.aiCode : null
      },
      player2: {
        username: battle.player2.username,
        side: battle.player2.side,
        units: battle.player2.units,
        submitted: battle.player2.submitted,
        aiCode: (playerRole === 'player2' || battle.status === 'completed') ? battle.player2.aiCode : null
      },
      result: battle.result,
      startedAt: battle.startedAt,
      completedAt: battle.completedAt,
      expiresAt: battle.expiresAt
    };

    res.json({
      success: true,
      battle: battleData,
      yourRole: playerRole
    });
  } catch (error) {
    console.error('Get battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get battle details',
      error: error.message
    });
  }
});

// @route   GET /api/battles/code/:battleCode
// @desc    Get battle by code (for joining)
// @access  Private
router.get('/code/:battleCode', authMiddleware, async (req, res) => {
  try {
    const { battleCode } = req.params;

    const battle = await Battle.findOne({ battleCode })
      .populate('player1.userId', 'name email')
      .populate('player2.userId', 'name email');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    res.json({
      success: true,
      battle: {
        id: battle._id,
        battleCode: battle.battleCode,
        status: battle.status,
        configuration: battle.configuration,
        player1: {
          username: battle.player1.username,
          side: battle.player1.side,
          unitCount: battle.player1.units.length
        },
        player2: battle.player2.userId ? {
          username: battle.player2.username,
          side: battle.player2.side,
          unitCount: battle.player2.units.length
        } : null,
        expiresAt: battle.expiresAt
      }
    });
  } catch (error) {
    console.error('Get battle by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get battle',
      error: error.message
    });
  }
});

// @route   GET /api/battles/user/history
// @desc    Get user's battle history
// @access  Private
router.get('/user/history', authMiddleware, async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [
        { 'player1.userId': req.user._id },
        { 'player2.userId': req.user._id }
      ],
      status: { $in: ['completed', 'cancelled'] }
    })
    .sort({ completedAt: -1 })
    .limit(20)
    .populate('player1.userId', 'name')
    .populate('player2.userId', 'name');

    const history = battles.map(battle => {
      const isPlayer1 = battle.player1.userId._id.toString() === req.user._id.toString();
      const opponent = isPlayer1 ? battle.player2 : battle.player1;
      const playerRole = isPlayer1 ? 'player1' : 'player2';
      
      let outcome = 'draw';
      if (battle.result.winner === playerRole) {
        outcome = 'won';
      } else if (battle.result.winner && battle.result.winner !== playerRole) {
        outcome = 'lost';
      }

      return {
        id: battle._id,
        battleCode: battle.battleCode,
        opponent: opponent.username,
        outcome,
        ticks: battle.result.ticks,
        completedAt: battle.completedAt
      };
    });

    res.json({
      success: true,
      battles: history
    });
  } catch (error) {
    console.error('Get battle history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get battle history',
      error: error.message
    });
  }
});

// @route   POST /api/war/:battleId/start
// @desc    Start the battle (when both players are ready)
// @access  Private
router.post('/:battleId/start', authMiddleware, async (req, res) => {
  try {
    const { battleId } = req.params;

    const battle = await Battle.findById(battleId);

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    const playerRole = battle.getPlayerRole(req.user._id);

    if (!playerRole) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this battle'
      });
    }

    if (!battle.isReadyToStart()) {
      return res.status(400).json({
        success: false,
        message: 'Battle is not ready to start. Both players must submit their setups.'
      });
    }

    if (battle.status === 'in_progress' || battle.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Battle has already started or completed'
      });
    }

    // Start battle asynchronously
    BattleService.startBattle(battleId, io).catch(error => {
      console.error('Battle execution error:', error);
    });

    res.json({
      success: true,
      message: 'Battle started',
      battleId: battle._id
    });
  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start battle',
      error: error.message
    });
  }
});

// @route   DELETE /api/war/:battleId
// @desc    Cancel a battle (only host can cancel before it starts)
// @access  Private
router.delete('/:battleId', authMiddleware, async (req, res) => {
  try {
    const { battleId } = req.params;

    const battle = await Battle.findById(battleId);

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    if (battle.player1.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can cancel the battle'
      });
    }

    if (battle.status === 'in_progress' || battle.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a battle that has started or completed'
      });
    }

    battle.status = 'cancelled';
    await battle.save();

    console.log(`❌ Battle cancelled: ${battle.battleCode}`);

    res.json({
      success: true,
      message: 'Battle cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel battle',
      error: error.message
    });
  }
});

// @route   GET /api/battles/:battleId/replay
// @desc    Get battle replay data
// @access  Private
router.get('/:battleId/replay', authMiddleware, async (req, res) => {
  try {
    const { battleId } = req.params;

    const battle = await Battle.findById(battleId)
      .populate('player1.userId', 'name')
      .populate('player2.userId', 'name');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    if (battle.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Battle replay is only available for completed battles'
      });
    }

    if (!battle.replay) {
      return res.status(404).json({
        success: false,
        message: 'Replay data not found for this battle'
      });
    }

    res.json({
      success: true,
      replay: battle.replay,
      battleInfo: {
        battleCode: battle.battleCode,
        player1: {
          username: battle.player1.username,
          aiCode: battle.player1.aiCode
        },
        player2: {
          username: battle.player2.username,
          aiCode: battle.player2.aiCode
        },
        result: battle.result,
        startedAt: battle.startedAt,
        completedAt: battle.completedAt
      }
    });
  } catch (error) {
    console.error('Get replay error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get battle replay',
      error: error.message
    });
  }
});

export default router;
