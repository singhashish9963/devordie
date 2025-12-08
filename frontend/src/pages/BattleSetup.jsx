import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import '../styles/BattleSetup.css';

function BattleSetup() {
  const { battleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { battleCode, isHost } = location.state || {};

  const [battle, setBattle] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Unit placement state
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedUnitType, setSelectedUnitType] = useState('soldier');
  const [placementMode, setPlacementMode] = useState(true);
  const [totalCost, setTotalCost] = useState(0);

  // AI code state
  const [aiCode, setAiCode] = useState(`// Your AI Strategy Code
function getAction(state) {
  const { self, enemies, allies, terrain, round } = state;
  
  // Find nearest enemy
  const nearestEnemy = enemies.sort((a, b) => {
    const distA = Math.abs(a.position.x - self.position.x) + 
                  Math.abs(a.position.y - self.position.y);
    const distB = Math.abs(b.position.x - self.position.x) + 
                  Math.abs(b.position.y - self.position.y);
    return distA - distB;
  })[0];

  if (nearestEnemy) {
    const distance = Math.abs(nearestEnemy.position.x - self.position.x) + 
                     Math.abs(nearestEnemy.position.y - self.position.y);
    
    // Attack if in range
    if (distance <= self.range) {
      return { action: 'attack', target: nearestEnemy.position };
    }
    
    // Move closer
    const dx = nearestEnemy.position.x > self.position.x ? 1 : -1;
    const dy = nearestEnemy.position.y > self.position.y ? 1 : -1;
    return { action: 'move', target: { x: self.position.x + dx, y: self.position.y + dy } };
  }

  // Hold position if no enemies
  return { action: 'move', target: self.position };
}
`);

  const unitTypes = [
    { type: 'soldier', name: 'Soldier', icon: '🪖', cost: 100, hp: 100, attack: 20, defense: 10, range: 1, speed: 5 },
    { type: 'archer', name: 'Archer', icon: '🏹', cost: 80, hp: 80, attack: 15, defense: 5, range: 5, speed: 4 },
    { type: 'tank', name: 'Tank', icon: '🛡️', cost: 150, hp: 150, attack: 30, defense: 20, range: 1, speed: 3 },
    { type: 'drone', name: 'Drone', icon: '🚁', cost: 120, hp: 60, attack: 10, defense: 2, range: 8, speed: 8 },
    { type: 'sniper', name: 'Sniper', icon: '🎯', cost: 140, hp: 70, attack: 50, defense: 5, range: 10, speed: 3 }
  ];

  useEffect(() => {
    fetchBattleDetails();
  }, [battleId]);

  useEffect(() => {
    // Calculate total cost
    const cost = selectedUnits.reduce((sum, unit) => {
      const unitInfo = unitTypes.find(u => u.type === unit.type);
      return sum + (unitInfo?.cost || 0);
    }, 0);
    setTotalCost(cost);
  }, [selectedUnits]);

  const fetchBattleDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/war/${battleId}`, {
        credentials: 'include'
      });

      const data = await response.json();
      console.log('API Response:', data);
      console.log('yourRole from API:', data.yourRole);
      console.log('Battle player1.userId:', data.battle?.player1?.userId);
      console.log('Battle player2.userId:', data.battle?.player2?.userId);

      if (data.success) {
        setBattle(data.battle);
        setPlayerRole(data.yourRole);
        console.log('Set playerRole to:', data.yourRole);
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

  const handleGridClick = (x, y) => {
    console.log('Grid clicked:', x, y);
    console.log('Placement mode:', placementMode);
    console.log('Selected unit type:', selectedUnitType);
    console.log('Player role:', playerRole);
    
    if (!placementMode) {
      console.log('Placement mode is off');
      return;
    }
    
    if (selectedUnits.length >= 10) {
      setError('Maximum 10 units allowed');
      return;
    }

    if (!playerRole) {
      console.log('No player role found');
      setError('Unable to determine your role in this battle');
      return;
    }

    // Validate placement zone (left side for player1, right side for player2)
    const isValidZone = playerRole === 'player1' 
      ? x >= 0 && x <= 8 
      : x >= 11 && x <= 19;

    console.log('Valid zone check:', isValidZone, 'for role:', playerRole);

    if (!isValidZone) {
      setError(`You can only place units on the ${playerRole === 'player1' ? 'left' : 'right'} side`);
      return;
    }

    // Check if position is occupied
    const occupied = selectedUnits.some(u => u.position.x === x && u.position.y === y);
    if (occupied) {
      setError('Position already occupied');
      return;
    }

    const unitInfo = unitTypes.find(u => u.type === selectedUnitType);
    if (totalCost + unitInfo.cost > 1000) {
      setError('Budget exceeded! Maximum 1000 points');
      return;
    }

    // Add unit
    const newUnit = {
      type: selectedUnitType,
      position: { x, y }
    };

    console.log('Adding unit:', newUnit);
    setSelectedUnits([...selectedUnits, newUnit]);
    setError('');
  };

  const removeUnit = (index) => {
    setSelectedUnits(selectedUnits.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedUnits.length === 0) {
      setError('Please place at least one unit');
      return;
    }

    if (!aiCode.trim()) {
      setError('Please write your AI code');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/war/${battleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          units: selectedUnits,
          aiCode: aiCode
        })
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to waiting room / battle viewer
        navigate(`/pvp/battle/${battleId}`, {
          state: { battleCode, isHost }
        });
      } else {
        setError(data.message || 'Failed to submit setup');
      }
    } catch (error) {
      setError('Failed to connect to server');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading battle...</div>;
  }

  const opponent = playerRole === 'player1' ? battle?.player2 : battle?.player1;

  return (
    <div className="battle-setup-container">
      <div className="setup-header">
        <div className="header-info">
          <h1>⚔️ Battle Setup</h1>
          <div className="battle-code-display">
            Battle Code: <span className="code">{battleCode || battle?.battleCode}</span>
          </div>
          <div className="opponent-info">
            {opponent?.username ? (
              <span>Opponent: <strong>{opponent.username}</strong> ✅</span>
            ) : (
              <span>Waiting for opponent... ⏳</span>
            )}
          </div>
        </div>
        <div className="budget-info">
          <div className="budget-bar">
            <div className="budget-used" style={{ width: `${(totalCost / 1000) * 100}%` }}></div>
          </div>
          <span className="budget-text">
            {totalCost} / 1000 points ({selectedUnits.length}/10 units)
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="setup-content">
        {/* Left Panel: Unit Selection & Grid */}
        <div className="left-panel">
          <div className="unit-selector">
            <h3>Select Unit Type</h3>
            <div className="unit-buttons">
              {unitTypes.map(unit => (
                <button
                  key={unit.type}
                  className={`unit-btn ${selectedUnitType === unit.type ? 'active' : ''}`}
                  onClick={() => setSelectedUnitType(unit.type)}
                >
                  <span className="unit-icon">{unit.icon}</span>
                  <span className="unit-name">{unit.name}</span>
                  <span className="unit-cost">{unit.cost}pt</span>
                </button>
              ))}
            </div>
            <div className="selected-unit-info">
              {unitTypes.find(u => u.type === selectedUnitType) && (
                <div className="unit-stats">
                  {(() => {
                    const unit = unitTypes.find(u => u.type === selectedUnitType);
                    return (
                      <>
                        <div>HP: {unit.hp}</div>
                        <div>ATK: {unit.attack}</div>
                        <div>DEF: {unit.defense}</div>
                        <div>RNG: {unit.range}</div>
                        <div>SPD: {unit.speed}</div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="battlefield-grid">
            <h3>Place Your Units</h3>
            <p className="placement-hint">
              {playerRole === 'player1' 
                ? 'Click on the LEFT side (columns 0-8) to place units' 
                : 'Click on the RIGHT side (columns 11-19) to place units'}
            </p>
            <div className="grid-container">
              {Array(20).fill(0).map((_, y) => (
                <div key={y} className="grid-row">
                  {Array(20).fill(0).map((_, x) => {
                    const unit = selectedUnits.find(u => u.position.x === x && u.position.y === y);
                    const isPlayerZone = playerRole === 'player1' ? x <= 8 : x >= 11;
                    const isMidline = x === 9 || x === 10;
                    
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`grid-cell ${isPlayerZone ? 'player-zone' : ''} ${isMidline ? 'midline' : ''}`}
                        onClick={() => handleGridClick(x, y)}
                      >
                        {unit && (
                          <span className="placed-unit">
                            {unitTypes.find(u => u.type === unit.type)?.icon}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="placed-units-list">
            <h3>Your Army ({selectedUnits.length}/10)</h3>
            {selectedUnits.map((unit, index) => {
              const unitInfo = unitTypes.find(u => u.type === unit.type);
              return (
                <div key={index} className="placed-unit-item">
                  <span>{unitInfo.icon} {unitInfo.name}</span>
                  <span>({unit.position.x}, {unit.position.y})</span>
                  <button onClick={() => removeUnit(index)} className="remove-btn">×</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: AI Code Editor */}
        <div className="right-panel">
          <h3>AI Strategy Code</h3>
          <div className="code-editor">
            <CodeMirror
              value={aiCode}
              height="500px"
              theme={oneDark}
              extensions={[javascript()]}
              onChange={(value) => setAiCode(value)}
            />
          </div>

          <div className="code-tips">
            <h4>💡 Quick Tips:</h4>
            <ul>
              <li><code>state.self</code> - Your unit's info (position, hp, attack, etc.)</li>
              <li><code>state.enemies</code> - Array of enemy units</li>
              <li><code>state.allies</code> - Your other units</li>
              <li>Return <code>{'{ action: "attack", target: {x, y} }'}</code> to attack</li>
              <li>Return <code>{'{ action: "move", target: {x, y} }'}</code> to move</li>
            </ul>
          </div>

          <div className="submit-section">
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={submitting || selectedUnits.length === 0}
            >
              {submitting ? 'Submitting...' : '✅ Submit Setup & Ready'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleSetup;
