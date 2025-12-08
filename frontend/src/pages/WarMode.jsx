import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WarMode.css';

function WarMode() {
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [battleCode, setBattleCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [battleHistory, setBattleHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load battle history
    fetchBattleHistory();
  }, []);

  const fetchBattleHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/war/user/history', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBattleHistory(data.battles || []);
      }
    } catch (error) {
      console.error('Failed to load battle history:', error);
    }
  };

  const handleCreateBattle = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/war/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          terrain: Array(20).fill(null).map(() => Array(20).fill(0)),
          gridSize: { width: 20, height: 20 },
          maxTurns: 1000,
          victoryCondition: 'elimination'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to battle setup
        navigate(`/war/setup/${data.battle.id}`, {
          state: { battleCode: data.battle.battleCode, isHost: true }
        });
      } else {
        setError(data.message || 'Failed to create battle');
      }
    } catch (error) {
      setError('Failed to connect to server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async () => {
    if (!battleCode.trim()) {
      setError('Please enter a battle code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/war/join/${battleCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to battle setup
        navigate(`/war/setup/${data.battle.id}`, {
          state: { battleCode: data.battle.battleCode, isHost: false }
        });
      } else {
        setError(data.message || 'Failed to join battle');
      }
    } catch (error) {
      setError('Failed to connect to server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="war-mode-container">
      <div className="war-mode-header">
        <h1>⚔️ WAR MODE - Multiplayer Battles</h1>
        <p>Challenge your friends to epic AI vs AI battles!</p>
      </div>

      {!mode ? (
        <div className="mode-selection">
          <button
            className="mode-button create-button"
            onClick={() => setMode('create')}
          >
            <div className="mode-icon">🎮</div>
            <h2>Create Battle</h2>
            <p>Setup your army and generate a battle code</p>
          </button>

          <button
            className="mode-button join-button"
            onClick={() => setMode('join')}
          >
            <div className="mode-icon">🤝</div>
            <h2>Join Battle</h2>
            <p>Enter a battle code to join a friend's battle</p>
          </button>
        </div>
      ) : mode === 'create' ? (
        <div className="action-panel">
          <h2>Create New Battle</h2>
          <p>Click below to create a new battle room and get your battle code</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="action-buttons">
            <button
              className="primary-button"
              onClick={handleCreateBattle}
              disabled={loading}
            >
              {loading ? 'Creating...' : '🎮 Create Battle Room'}
            </button>
            <button
              className="secondary-button"
              onClick={() => setMode(null)}
            >
              ← Back
            </button>
          </div>
        </div>
      ) : (
        <div className="action-panel">
          <h2>Join Battle</h2>
          <p>Enter the battle code shared by your friend</p>
          
          <div className="join-form">
            <input
              type="text"
              placeholder="Enter battle code (e.g., WAR-ABC123)"
              value={battleCode}
              onChange={(e) => setBattleCode(e.target.value.toUpperCase())}
              className="battle-code-input"
              maxLength={10}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="action-buttons">
            <button
              className="primary-button"
              onClick={handleJoinBattle}
              disabled={loading || !battleCode.trim()}
            >
              {loading ? 'Joining...' : '🤝 Join Battle'}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setMode(null);
                setBattleCode('');
                setError('');
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Battle History */}
      {battleHistory.length > 0 && (
        <div className="battle-history">
          <h2>Your Battle History</h2>
          <div className="history-list">
            {battleHistory.map((battle) => (
              <div key={battle.id} className="history-item">
                <div className="history-info">
                  <span className="battle-code">{battle.battleCode}</span>
                  <span className="opponent">vs {battle.opponent}</span>
                  <span className={`outcome outcome-${battle.outcome}`}>
                    {battle.outcome === 'won' ? '🏆 Victory' : 
                     battle.outcome === 'lost' ? '💀 Defeat' : 
                     '🤝 Draw'}
                  </span>
                  <span className="ticks">{battle.ticks} ticks</span>
                </div>
                <button
                  className="view-button"
                  onClick={() => navigate(`/pvp/replay/${battle.id}`)}
                >
                  📽️ Watch Replay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WarMode;
