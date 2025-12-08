import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import BattleAnalysis from '../components/BattleAnalysis';
import '../styles/BattleViewer.css';

function BattleViewer() {
  const { battleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { battleCode, isHost } = location.state || {};
  
  const [battle, setBattle] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canStart, setCanStart] = useState(false);
  const [battleStatus, setBattleStatus] = useState('waiting'); // waiting, in_progress, completed
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  
  const canvasRef = useRef(null);
  const socket = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socket.current = getSocket();
    
    // Join battle room
    socket.current.emit('join-battle', battleId);
    console.log(`👥 Joined battle room: ${battleId}`);

    // Fetch initial battle data
    fetchBattleDetails();

    // Listen for socket events
    socket.current.on('battle-started', handleBattleStarted);
    socket.current.on('tick-update', handleTickUpdate);
    socket.current.on('battle-ended', handleBattleEnded);

    return () => {
      // Clean up socket listeners
      socket.current.off('battle-started');
      socket.current.off('tick-update');
      socket.current.off('battle-ended');
      socket.current.emit('leave-battle', battleId);
    };
  }, [battleId]);

  useEffect(() => {
    // Auto-scroll combat log
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combatLog]);

  useEffect(() => {
    // Draw battlefield
    if (battleState && canvasRef.current) {
      drawBattlefield();
    }
  }, [battleState]);

  const fetchBattleDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/war/${battleId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setBattle(data.battle);
        setBattleStatus(data.battle.status);
        setPlayerRole(data.yourRole); // Save player role from API
        
        // Check if both players are ready
        const bothReady = data.battle.player1?.submitted && data.battle.player2?.submitted;
        setCanStart(bothReady && data.battle.status === 'ready');
      } else {
        setError(data.message || 'Failed to load battle');
      }
    } catch (error) {
      setError('Failed to connect to server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBattleStarted = (data) => {
    console.log('⚔️ Battle started!', data);
    setBattleStatus('in_progress');
    setCanStart(false);
    setCombatLog([{ type: 'info', message: '⚔️ Battle has begun!' }]);
  };

  const handleTickUpdate = (data) => {
    const { tick, player1Units, player2Units, events } = data;
    
    setBattleState({
      tick,
      player1Units,
      player2Units
    });

    // Add events to combat log
    if (events && events.length > 0) {
      const newLogs = events.map(event => {
        if (event.type === 'attack') {
          return {
            type: 'combat',
            message: `🎯 ${event.player === 'player1' ? '🔴' : '🔵'} ${event.attacker} attacked ${event.target} for ${event.damage} damage${event.killed ? ' 💀' : ''}`
          };
        } else if (event.type === 'move') {
          return {
            type: 'move',
            message: `🚶 ${event.player === 'player1' ? '🔴' : '🔵'} ${event.unitType} moved to (${event.to.x}, ${event.to.y})`
          };
        }
        return null;
      }).filter(Boolean);

      setCombatLog(prev => [...prev, ...newLogs].slice(-100)); // Keep last 100 logs
    }
  };

  const handleBattleEnded = (data) => {
    console.log('🏆 Battle ended!', data);
    setBattleStatus('completed');
    
    const winnerText = data.winner === 'draw' 
      ? '🤝 Battle ended in a DRAW!' 
      : `🏆 ${data.winner === 'player1' ? 'Player 1 (Red)' : 'Player 2 (Blue)'} WINS!`;
    
    setCombatLog(prev => [
      ...prev,
      { type: 'info', message: winnerText },
      { type: 'info', message: `Battle lasted ${data.ticks} ticks` },
      { type: 'info', message: `Reason: ${data.endReason}` }
    ]);

    // Refresh battle data to show results
    setTimeout(() => {
      fetchBattleDetails();
      // Auto-show analysis after battle ends
      setTimeout(() => setShowAnalysis(true), 2000);
    }, 1000);
  };

  const drawBattlefield = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cellSize = 25;
    const gridSize = 20;

    canvas.width = cellSize * gridSize;
    canvas.height = cellSize * gridSize;

    // Clear canvas
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw midline
    ctx.strokeStyle = '#ed8936';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(9 * cellSize, 0);
    ctx.lineTo(9 * cellSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(11 * cellSize, 0);
    ctx.lineTo(11 * cellSize, canvas.height);
    ctx.stroke();

    // Draw player 1 units (Red)
    if (battleState?.player1Units) {
      battleState.player1Units.forEach(unit => {
        if (unit.hp > 0) {
          drawUnit(ctx, unit, cellSize, '#ef4444');
        }
      });
    }

    // Draw player 2 units (Blue)
    if (battleState?.player2Units) {
      battleState.player2Units.forEach(unit => {
        if (unit.hp > 0) {
          drawUnit(ctx, unit, cellSize, '#3b82f6');
        }
      });
    }
  };

  const drawUnit = (ctx, unit, cellSize, color) => {
    const x = unit.position.x * cellSize + cellSize / 2;
    const y = unit.position.y * cellSize + cellSize / 2;
    const radius = cellSize / 3;

    // Unit circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    const hpPercent = unit.hp / unit.maxHp;
    const barWidth = cellSize - 4;
    const barHeight = 3;
    const barX = unit.position.x * cellSize + 2;
    const barY = (unit.position.y + 1) * cellSize - 5;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = hpPercent > 0.5 ? '#48bb78' : hpPercent > 0.25 ? '#ed8936' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
  };

  const handleStartBattle = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/war/${battleId}/start`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to start battle');
      }
    } catch (error) {
      setError('Failed to start battle');
      console.error(error);
    }
  };

  const exportBattleLogs = () => {
    try {
      // Prepare log content
      const logHeader = `=================================
BATTLE LOG EXPORT
=================================
Battle Code: ${battle?.battleCode || 'N/A'}
Battle ID: ${battleId}
Status: ${battleStatus}
Exported: ${new Date().toLocaleString()}
=================================

BATTLE INFORMATION:
Player 1: ${battle?.player1?.username || 'N/A'}
Player 2: ${battle?.player2?.username || 'N/A'}
Started: ${battle?.startedAt ? new Date(battle.startedAt).toLocaleString() : 'N/A'}
${battle?.completedAt ? `Completed: ${new Date(battle.completedAt).toLocaleString()}` : ''}
${battle?.result?.winner ? `Winner: ${battle.result.winner === 'draw' ? 'DRAW' : battle.result.winner === 'player1' ? battle.player1.username : battle.player2.username}` : ''}
${battle?.result?.ticks ? `Total Ticks: ${battle.result.ticks}` : ''}

=================================
COMBAT LOG:
=================================

`;

      // Format combat log entries
      const logEntries = combatLog.map((log, index) => {
        const timestamp = `[${index.toString().padStart(4, '0')}]`;
        const typeLabel = log.type === 'combat' ? '[COMBAT]' : 
                         log.type === 'move' ? '[MOVE]' : 
                         '[INFO]';
        return `${timestamp} ${typeLabel} ${log.message}`;
      }).join('\n');

      const fullLog = logHeader + logEntries;

      // Create blob and download
      const blob = new Blob([fullLog], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `battle-log-${battle?.battleCode || battleId}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Battle logs exported successfully');
    } catch (error) {
      console.error('Failed to export logs:', error);
      setError('Failed to export battle logs');
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading battle...</div>;
  }

  const player1 = battle?.player1;
  const player2 = battle?.player2;

  return (
    <div className="battle-viewer-container">
      <div className="battle-header">
        <div className="header-left">
          <h1>⚔️ Live Battle</h1>
          <div className="battle-code-badge">
            {battleCode || battle?.battleCode}
          </div>
        </div>
        <div className="header-right">
          <div className="status-badge" data-status={battleStatus}>
            {battleStatus === 'waiting' && '⏳ Waiting'}
            {battleStatus === 'ready' && '✅ Ready'}
            {battleStatus === 'in_progress' && '⚔️ Fighting'}
            {battleStatus === 'completed' && '🏆 Completed'}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="battle-content">
        {/* Left: Player Info */}
        <div className="players-panel">
          <div className="player-card player1">
            <div className="player-header">
              <span className="player-icon">🔴</span>
              <span className="player-name">{player1?.username || 'Player 1'}</span>
            </div>
            <div className="player-stats">
              <div className="stat">
                <span className="stat-label">Units</span>
                <span className="stat-value">
                  {battleState?.player1Units?.filter(u => u.hp > 0).length || player1?.units?.length || 0}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Total HP</span>
                <span className="stat-value">
                  {battleState?.player1Units?.reduce((sum, u) => sum + Math.max(0, u.hp), 0) || 0}
                </span>
              </div>
              {battle?.result && (
                <>
                  <div className="stat">
                    <span className="stat-label">Kills</span>
                    <span className="stat-value">{battle.result.stats.player1.kills}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Damage</span>
                    <span className="stat-value">{battle.result.stats.player1.damage}</span>
                  </div>
                </>
              )}
            </div>
            {player1?.submitted && <div className="ready-badge">✅ Ready</div>}
          </div>

          <div className="vs-divider">VS</div>

          <div className="player-card player2">
            <div className="player-header">
              <span className="player-icon">🔵</span>
              <span className="player-name">{player2?.username || 'Player 2'}</span>
            </div>
            <div className="player-stats">
              <div className="stat">
                <span className="stat-label">Units</span>
                <span className="stat-value">
                  {battleState?.player2Units?.filter(u => u.hp > 0).length || player2?.units?.length || 0}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Total HP</span>
                <span className="stat-value">
                  {battleState?.player2Units?.reduce((sum, u) => sum + Math.max(0, u.hp), 0) || 0}
                </span>
              </div>
              {battle?.result && (
                <>
                  <div className="stat">
                    <span className="stat-label">Kills</span>
                    <span className="stat-value">{battle.result.stats.player2.kills}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Damage</span>
                    <span className="stat-value">{battle.result.stats.player2.damage}</span>
                  </div>
                </>
              )}
            </div>
            {player2?.submitted && <div className="ready-badge">✅ Ready</div>}
          </div>

          {canStart && battleStatus === 'ready' && (
            <button className="start-battle-btn" onClick={handleStartBattle}>
              ⚔️ START BATTLE
            </button>
          )}

          {battleStatus === 'waiting' && (
            <div className="waiting-message">
              ⏳ Waiting for {player2?.username ? 'both players to submit setups' : 'opponent to join'}
            </div>
          )}

          {battleStatus === 'completed' && battle?.result && (
            <div className="battle-result">
              <div className="result-winner">
                {battle.result.winner === 'draw' 
                  ? '🤝 DRAW' 
                  : battle.result.winner === 'player1' 
                  ? '🔴 Player 1 WINS!' 
                  : '🔵 Player 2 WINS!'}
              </div>
              <div className="result-info">
                <div>Ticks: {battle.result.ticks}</div>
                <div>Reason: {battle.result.endReason}</div>
              </div>
              <div className="result-actions">
                <button className="analysis-btn" onClick={() => setShowAnalysis(true)}>
                  🤖 View AI Analysis
                </button>
                <button className="rematch-btn" onClick={() => navigate('/pvp')}>
                  🔄 New Battle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Battlefield */}
        <div className="battlefield-panel">
          <div className="battlefield-header">
            <h3>Battlefield</h3>
            {battleState && (
              <div className="tick-counter">Tick: {battleState.tick}</div>
            )}
          </div>
          <div className="battlefield-canvas-wrapper">
            <canvas ref={canvasRef} className="battlefield-canvas"></canvas>
          </div>
        </div>

        {/* Right: Combat Log */}
        <div className="combat-log-panel">
          <div className="combat-log-header">
            <h3>Combat Log</h3>
            <button 
              className="export-logs-btn" 
              onClick={exportBattleLogs}
              title="Export battle logs as text file"
            >
              📄 Export
            </button>
          </div>
          <div className="combat-log">
            {combatLog.length === 0 ? (
              <div className="log-empty">Waiting for battle to start...</div>
            ) : (
              combatLog.map((log, index) => (
                <div key={index} className={`log-entry log-${log.type}`}>
                  {log.message}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* AI Battle Analysis Modal */}
      {showAnalysis && battleStatus === 'completed' && (
        <BattleAnalysis 
          battleId={battleId}
          playerRole={playerRole}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  );
}

export default BattleViewer;
