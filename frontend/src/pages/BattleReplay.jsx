import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BattleReplay.css';

function BattleReplay() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replay, setReplay] = useState(null);
  const [battleInfo, setBattleInfo] = useState(null);
  const [currentTick, setCurrentTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    fetchReplay();
  }, [battleId]);

  useEffect(() => {
    if (replay && currentTick < replay.ticks.length) {
      drawBattlefield();
    }
  }, [currentTick, replay]);

  useEffect(() => {
    let interval;
    if (isPlaying && replay && currentTick < replay.ticks.length) {
      interval = setInterval(() => {
        setCurrentTick(prev => {
          if (prev >= replay.ticks.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTick, replay, playbackSpeed]);

  const fetchReplay = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/war/${battleId}/replay`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setReplay(data.replay);
        setBattleInfo(data.battleInfo);
      } else {
        setError(data.message || 'Failed to load replay');
      }
    } catch (error) {
      setError('Failed to connect to server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const drawBattlefield = () => {
    const canvas = canvasRef.current;
    if (!canvas || !replay) return;

    const ctx = canvas.getContext('2d');
    const cellSize = 25;
    const gridSize = 20;

    // Clear canvas
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, gridSize * cellSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(gridSize * cellSize, i * cellSize);
      ctx.stroke();
    }

    // Draw midline
    ctx.strokeStyle = '#ed8936';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(9.5 * cellSize, 0);
    ctx.lineTo(9.5 * cellSize, gridSize * cellSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10.5 * cellSize, 0);
    ctx.lineTo(10.5 * cellSize, gridSize * cellSize);
    ctx.stroke();

    const tickData = replay.ticks[currentTick];
    if (!tickData) return;

    // Draw player1 units (red)
    tickData.player1Units.forEach(unit => {
      if (unit.hp > 0) {
        drawUnit(ctx, unit, cellSize, '#ef4444');
      }
    });

    // Draw player2 units (blue)
    tickData.player2Units.forEach(unit => {
      if (unit.hp > 0) {
        drawUnit(ctx, unit, cellSize, '#3b82f6');
      }
    });
  };

  const drawUnit = (ctx, unit, cellSize, color) => {
    const x = unit.position.x * cellSize + cellSize / 2;
    const y = unit.position.y * cellSize + cellSize / 2;
    const radius = cellSize * 0.35;

    // Draw unit circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw HP bar
    const hpPercent = unit.hp / unit.maxHp;
    const barWidth = cellSize * 0.8;
    const barHeight = 4;
    const barX = x - barWidth / 2;
    const barY = y + radius + 3;

    // Background
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // HP fill
    ctx.fillStyle = hpPercent > 0.5 ? '#48bb78' : hpPercent > 0.2 ? '#ed8936' : '#f56565';
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTick(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const handleSeek = (tick) => {
    setCurrentTick(tick);
  };

  const exportReplayLogs = () => {
    try {
      // Prepare log content
      const logHeader = `=================================
BATTLE REPLAY LOG EXPORT
=================================
Battle Code: ${battleInfo?.battleCode || 'N/A'}
Battle ID: ${battleId}
Exported: ${new Date().toLocaleString()}
=================================

BATTLE INFORMATION:
Player 1: ${battleInfo?.player1?.username || 'N/A'}
Player 2: ${battleInfo?.player2?.username || 'N/A'}
Winner: ${battleInfo?.result?.winner === 'draw' ? 'DRAW' : 
          battleInfo?.result?.winner === 'player1' ? battleInfo?.player1?.username :
          battleInfo?.player2?.username}
Total Ticks: ${battleInfo?.result?.ticks || 0}
End Reason: ${battleInfo?.result?.endReason || 'N/A'}
Started: ${battleInfo?.startedAt ? new Date(battleInfo.startedAt).toLocaleString() : 'N/A'}
Completed: ${battleInfo?.completedAt ? new Date(battleInfo.completedAt).toLocaleString() : 'N/A'}

BATTLE STATISTICS:
Player 1:
  - Kills: ${battleInfo?.result?.stats?.player1?.kills || 0}
  - Damage: ${battleInfo?.result?.stats?.player1?.damage || 0}
  - Units Lost: ${battleInfo?.result?.stats?.player1?.unitsLost || 0}
  
Player 2:
  - Kills: ${battleInfo?.result?.stats?.player2?.kills || 0}
  - Damage: ${battleInfo?.result?.stats?.player2?.damage || 0}
  - Units Lost: ${battleInfo?.result?.stats?.player2?.unitsLost || 0}

=================================
TICK-BY-TICK REPLAY:
=================================

`;

      // Format all tick events
      let tickLogs = '';
      replay.ticks.forEach((tickData, tickIndex) => {
        tickLogs += `\n--- TICK ${tickIndex} ---\n`;
        tickLogs += `Player 1 Units Alive: ${tickData.player1Units.filter(u => u.hp > 0).length}\n`;
        tickLogs += `Player 2 Units Alive: ${tickData.player2Units.filter(u => u.hp > 0).length}\n`;
        
        if (tickData.events && tickData.events.length > 0) {
          tickData.events.forEach(event => {
            if (event.type === 'attack') {
              tickLogs += `  [COMBAT] ${event.player === 'player1' ? 'Player 1' : 'Player 2'}: ${event.attacker} attacked ${event.target} for ${event.damage} damage${event.killed ? ' (KILLED)' : ''}\n`;
            } else if (event.type === 'move') {
              tickLogs += `  [MOVE] ${event.player === 'player1' ? 'Player 1' : 'Player 2'}: ${event.unitType} moved to (${event.to.x}, ${event.to.y})\n`;
            }
          });
        } else {
          tickLogs += `  No events\n`;
        }
      });

      const fullLog = logHeader + tickLogs;

      // Create blob and download
      const blob = new Blob([fullLog], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `battle-replay-${battleInfo?.battleCode || battleId}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Replay logs exported successfully');
    } catch (error) {
      console.error('Failed to export replay logs:', error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading replay...</div>;
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>{error}</h2>
        <button onClick={() => navigate('/pvp')}>Back to PvP Arena</button>
      </div>
    );
  }

  return (
    <div className="replay-container">
      <div className="replay-header">
        <button onClick={() => navigate('/pvp')} className="back-btn">← Back</button>
        <h1>Battle Replay: {battleInfo?.battleCode}</h1>
        <div className="header-actions">
          <button onClick={exportReplayLogs} className="export-btn" title="Export full replay logs">
            📄 Export Logs
          </button>
          <div className="result-badge">
            Winner: {battleInfo?.result?.winner === 'draw' ? 'DRAW' : 
                     battleInfo?.result?.winner === 'player1' ? battleInfo?.player1?.username :
                     battleInfo?.player2?.username}
          </div>
        </div>
      </div>

      <div className="replay-content">
        <div className="replay-left-panel">
          <div className="player-info">
            <h3>Player 1: {battleInfo?.player1?.username}</h3>
            <div className="stats">
              <div>Kills: {battleInfo?.result?.stats?.player1?.kills}</div>
              <div>Damage: {battleInfo?.result?.stats?.player1?.damage}</div>
              <div>Units Lost: {battleInfo?.result?.stats?.player1?.unitsLost}</div>
            </div>
          </div>

          <div className="player-info">
            <h3>Player 2: {battleInfo?.player2?.username}</h3>
            <div className="stats">
              <div>Kills: {battleInfo?.result?.stats?.player2?.kills}</div>
              <div>Damage: {battleInfo?.result?.stats?.player2?.damage}</div>
              <div>Units Lost: {battleInfo?.result?.stats?.player2?.unitsLost}</div>
            </div>
          </div>
        </div>

        <div className="replay-main">
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="replay-canvas"
            />
          </div>

          <div className="replay-controls">
            <button onClick={handleRestart} className="control-btn">⏮ Restart</button>
            <button onClick={handlePlayPause} className="control-btn play-btn">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <div className="speed-controls">
              <span>Speed:</span>
              {[0.5, 1, 2, 4].map(speed => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="tick-info">
              Tick: {currentTick} / {replay?.ticks?.length || 0}
            </div>
          </div>

          <div className="timeline">
            <input
              type="range"
              min="0"
              max={(replay?.ticks?.length || 1) - 1}
              value={currentTick}
              onChange={(e) => handleSeek(parseInt(e.target.value))}
              className="timeline-slider"
            />
          </div>
        </div>

        <div className="replay-right-panel">
          <h3>Events (Tick {currentTick})</h3>
          <div className="events-list">
            {replay?.ticks[currentTick]?.events.map((event, idx) => (
              <div key={idx} className={`event-item event-${event.type}`}>
                {event.type === 'attack' && (
                  <span>
                    {event.attacker} attacked {event.target} for {event.damage} damage
                    {event.killed && ' 💀'}
                  </span>
                )}
                {event.type === 'move' && (
                  <span>{event.unit} moved to ({event.to.x}, {event.to.y})</span>
                )}
              </div>
            ))}
            {(!replay?.ticks[currentTick]?.events || replay?.ticks[currentTick]?.events.length === 0) && (
              <div className="no-events">No events this tick</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleReplay;
