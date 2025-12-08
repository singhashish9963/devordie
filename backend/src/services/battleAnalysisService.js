import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Battle Analysis Service using Gemini 2.0 Flash
 * Provides post-battle strategy analysis for both players
 */
export class BattleAnalysisService {
  
  /**
   * Generate comprehensive battle analysis for both players
   * @param {Object} battle - Battle document with replay data
   * @returns {Object} Analysis for both players
   */
  static async analyzeBattle(battle) {
    try {
      if (!battle.replay || !battle.result) {
        throw new Error('Battle must be completed with replay data');
      }

      console.log(`🤖 Generating AI analysis for battle ${battle.battleCode}...`);

      // Extract battle data
      const battleData = this.extractBattleData(battle);

      // Generate analysis for both players in parallel
      const [player1Analysis, player2Analysis] = await Promise.all([
        this.generatePlayerAnalysis(battleData, 'player1'),
        this.generatePlayerAnalysis(battleData, 'player2')
      ]);

      return {
        battleCode: battle.battleCode,
        winner: battle.result.winner,
        ticks: battle.result.ticks,
        player1: player1Analysis,
        player2: player2Analysis,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Battle analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Extract relevant battle data for analysis
   */
  static extractBattleData(battle) {
    const { replay, result, player1, player2, configuration } = battle;

    // Calculate key metrics
    const p1Events = replay.ticks.flatMap(t => t.events.filter(e => e.player === 'player1'));
    const p2Events = replay.ticks.flatMap(t => t.events.filter(e => e.player === 'player2'));

    return {
      configuration,
      player1: {
        username: player1.username,
        units: player1.units,
        aiCode: player1.aiCode,
        stats: result.stats.player1,
        events: p1Events,
        isWinner: result.winner === 'player1'
      },
      player2: {
        username: player2.username,
        units: player2.units,
        aiCode: player2.aiCode,
        stats: result.stats.player2,
        events: p2Events,
        isWinner: result.winner === 'player2'
      },
      result,
      replay
    };
  }

  /**
   * Generate analysis for a specific player using Gemini 2.0 Flash
   */
  static async generatePlayerAnalysis(battleData, playerKey) {
    const player = battleData[playerKey];
    const opponent = playerKey === 'player1' ? battleData.player2 : battleData.player1;
    const isDraw = battleData.result.winner === 'draw';

    // Create analysis prompt
    const prompt = this.createAnalysisPrompt(player, opponent, battleData, isDraw);

    try {
      // Use Gemini 2.0 Flash for fast, efficient analysis
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2000,
        }
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const analysis = response.text();

      // Parse the structured analysis
      return this.parseAnalysis(analysis, player);

    } catch (error) {
      console.error(`❌ Gemini API error for ${playerKey}:`, error.message);
      
      // Return fallback analysis if API fails
      return this.generateFallbackAnalysis(player, opponent, isDraw);
    }
  }

  /**
   * Create detailed analysis prompt for Gemini
   */
  static createAnalysisPrompt(player, opponent, battleData, isDraw) {
    const outcome = isDraw ? 'DRAW' : (player.isWinner ? 'VICTORY' : 'DEFEAT');

    return `You are an expert battle strategy analyst for a tactical combat game. Analyze this player's performance and provide actionable insights.

## BATTLE OUTCOME: ${outcome}

## PLAYER STATS:
- Username: ${player.username}
- Units Deployed: ${player.units.map(u => u.type).join(', ')}
- Kills: ${player.stats.kills}
- Damage Dealt: ${player.stats.damage}
- Units Lost: ${player.stats.unitsLost}
- Final HP: ${player.stats.finalHP}

## OPPONENT STATS:
- Username: ${opponent.username}
- Units Deployed: ${opponent.units.map(u => u.type).join(', ')}
- Kills: ${opponent.stats.kills}
- Damage Dealt: ${opponent.stats.damage}
- Units Lost: ${opponent.stats.unitsLost}
- Final HP: ${opponent.stats.finalHP}

## BATTLE DETAILS:
- Total Ticks: ${battleData.result.ticks}
- End Reason: ${battleData.result.endReason}
- Map Size: ${battleData.configuration.gridSize.width}x${battleData.configuration.gridSize.height}
- Max Turns: ${battleData.configuration.maxTurns}

## PLAYER'S AI STRATEGY CODE:
\`\`\`javascript
${player.aiCode || 'No custom AI code provided'}
\`\`\`

## OPPONENT'S AI STRATEGY CODE:
\`\`\`javascript
${opponent.aiCode || 'No custom AI code provided'}
\`\`\`

## KEY EVENTS ANALYSIS:
- Player Attacks: ${player.events.filter(e => e.type === 'attack').length}
- Player Moves: ${player.events.filter(e => e.type === 'move').length}
- Player Kills: ${player.events.filter(e => e.type === 'attack' && e.killed).length}

Please provide a comprehensive analysis in the following JSON format:

{
  "summary": "2-3 sentence overall performance summary",
  "strengths": [
    "Strength 1 with specific example",
    "Strength 2 with specific example",
    "Strength 3 with specific example"
  ],
  "weaknesses": [
    "Weakness 1 with specific issue",
    "Weakness 2 with specific issue",
    "Weakness 3 with specific issue"
  ],
  "strategyAnalysis": {
    "yourApproach": "Analysis of player's strategy approach",
    "opponentApproach": "Analysis of opponent's strategy",
    "keyDifferences": "How strategies differed and impact"
  },
  "improvements": [
    {
      "category": "Positioning|Targeting|Unit Composition|Decision Making",
      "issue": "Specific problem observed",
      "suggestion": "Concrete improvement suggestion",
      "codeExample": "Optional code snippet to fix the issue"
    }
  ],
  "tacticalAdvice": [
    "Specific tactical tip #1",
    "Specific tactical tip #2",
    "Specific tactical tip #3"
  ],
  "whatCouldHaveBeenDone": "Detailed analysis of alternative strategies that could have changed the outcome"
}

Focus on:
1. Specific, actionable feedback based on actual battle events
2. Code-level improvements they can implement
3. Tactical mistakes and how to avoid them
4. What the opponent did better (if they lost) or what player did better (if they won)
5. Alternative strategies that could have changed the outcome

Be honest, specific, and educational. Use battle statistics to support your points.`;
  }

  /**
   * Parse Gemini's response into structured format
   */
  static parseAnalysis(analysisText, player) {
    try {
      // Extract JSON from response (Gemini might wrap it in markdown)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          rawAnalysis: analysisText
        };
      }

      // If no valid JSON, return the raw text with basic structure
      return {
        summary: analysisText.substring(0, 300),
        strengths: ["See detailed analysis below"],
        weaknesses: ["See detailed analysis below"],
        strategyAnalysis: {
          yourApproach: "See detailed analysis below",
          opponentApproach: "See detailed analysis below",
          keyDifferences: "See detailed analysis below"
        },
        improvements: [],
        tacticalAdvice: ["See detailed analysis below"],
        whatCouldHaveBeenDone: "See detailed analysis below",
        rawAnalysis: analysisText
      };

    } catch (error) {
      console.error('❌ Failed to parse analysis:', error.message);
      return {
        summary: analysisText.substring(0, 300),
        rawAnalysis: analysisText,
        parseError: true
      };
    }
  }

  /**
   * Generate basic fallback analysis if Gemini API fails
   */
  static generateFallbackAnalysis(player, opponent, isDraw) {
    const won = player.isWinner;
    const kdr = player.stats.unitsLost > 0 
      ? (player.stats.kills / player.stats.unitsLost).toFixed(2)
      : player.stats.kills;

    return {
      summary: isDraw 
        ? `Battle ended in a draw. Both players showed resilience with ${player.stats.kills} kills for you vs ${opponent.stats.kills} for opponent.`
        : won
          ? `Victory! You defeated ${opponent.username} with superior tactics, achieving ${player.stats.kills} kills and ${player.stats.damage} total damage.`
          : `Defeat. ${opponent.username} outmaneuvered your forces. They achieved ${opponent.stats.kills} kills vs your ${player.stats.kills}.`,
      
      strengths: [
        `Dealt ${player.stats.damage} total damage to enemy units`,
        `Achieved ${player.stats.kills} kills in combat`,
        `Kill/Death ratio: ${kdr}`
      ].filter(s => !s.includes('NaN')),
      
      weaknesses: [
        player.stats.unitsLost === player.units.length ? "All units were eliminated - improve survival tactics" : `Lost ${player.stats.unitsLost} units`,
        player.stats.damage < opponent.stats.damage ? "Dealt less damage than opponent - be more aggressive" : null,
        player.stats.kills < opponent.stats.kills ? "Fewer kills than opponent - improve targeting" : null
      ].filter(Boolean),
      
      strategyAnalysis: {
        yourApproach: "Basic fallback analysis - detailed AI analysis unavailable",
        opponentApproach: `Opponent deployed ${opponent.units.length} units and achieved ${opponent.stats.kills} kills`,
        keyDifferences: `Your K/D: ${kdr} vs Opponent K/D: ${(opponent.stats.kills / Math.max(1, opponent.stats.unitsLost)).toFixed(2)}`
      },
      
      improvements: [
        {
          category: "Unit Composition",
          issue: `You used: ${player.units.map(u => u.type).join(', ')}`,
          suggestion: "Experiment with different unit combinations for better synergy"
        },
        {
          category: "Combat Efficiency",
          issue: `Damage per unit: ${(player.stats.damage / player.units.length).toFixed(0)}`,
          suggestion: "Focus on maximizing damage output per unit"
        }
      ],
      
      tacticalAdvice: [
        "Review your AI code's targeting logic for efficiency",
        "Consider unit positioning and range advantages",
        "Analyze opponent's strategy code for insights"
      ],
      
      whatCouldHaveBeenDone: won
        ? "You won! To improve further, focus on minimizing unit losses while maintaining kill pressure."
        : "Focus on better unit positioning, target prioritization, and damage optimization. Study the opponent's strategy for insights.",
      
      fallback: true
    };
  }

  /**
   * Generate quick summary for immediate display
   */
  static generateQuickSummary(battle) {
    const { result } = battle;
    const isDraw = result.winner === 'draw';

    return {
      battleCode: battle.battleCode,
      winner: result.winner,
      summary: isDraw
        ? "The battle ended in a tactical draw. Both commanders showed equal prowess."
        : `${result.winner === 'player1' ? battle.player1.username : battle.player2.username} achieved victory through superior tactics!`,
      stats: {
        player1: result.stats.player1,
        player2: result.stats.player2
      },
      ticks: result.ticks,
      endReason: result.endReason
    };
  }
}

export default BattleAnalysisService;
