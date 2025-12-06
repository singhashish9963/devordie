import { useState } from 'react';
import '../styles/AICodeGenerator.css';

export default function AICodeGenerator({ onCodeGenerated, unitTypes = [], terrainTypes = [] }) {
  const [strategy, setStrategy] = useState('balanced');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const strategies = [
    { id: 'aggressive', icon: '🗡️', name: 'Aggressive', desc: 'Rush and attack relentlessly' },
    { id: 'defensive', icon: '🛡️', name: 'Defensive', desc: 'Hold position and defend' },
    { id: 'balanced', icon: '⚖️', name: 'Balanced', desc: 'Mix of offense and defense' },
    { id: 'sniper', icon: '🎯', name: 'Sniper', desc: 'Long-range focused attacks' },
    { id: 'hitAndRun', icon: '🏃', name: 'Hit & Run', desc: 'Quick strikes, constant movement' },
    { id: 'terrainMaster', icon: '🏔️', name: 'Terrain Master', desc: 'Control strategic positions' }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          strategy: useCustomPrompt ? 'custom' : strategy,
          unitTypes: unitTypes.length > 0 ? unitTypes : ['soldier', 'tank'],
          terrain: terrainTypes.length > 0 ? terrainTypes : ['ground', 'mountain'],
          difficulty: 'medium',
          customInstructions: useCustomPrompt ? customPrompt : ''
        })
      });

      const data = await response.json();

      if (data.success && data.code) {
        onCodeGenerated(data.code);
        
        // Show appropriate message
        if (data.cached) {
          const ageMinutes = Math.floor(data.cacheAge / 60000);
          setSuccessMessage(`✅ Using cached strategy (${ageMinutes} min old) - saving API quota!`);
        } else if (data.usingFallback) {
          setError(`⚠️ ${data.warning || 'Using fallback strategy'}`);
        } else {
          setSuccessMessage('✅ AI strategy generated successfully!');
        }
        
        // Close modal after showing message
        setTimeout(() => {
          setShowModal(false);
          setSuccessMessage('');
          setError('');
        }, 2000);
      } else {
        setError(data.message || data.warning || 'Generation failed');
      }
    } catch (err) {
      setError('❌ Failed to connect to server');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="ai-generator-btn"
        title="Generate AI strategy using Gemini Flash"
      >
        ✨ AI Strategy
      </button>

      {showModal && (
        <div className="ai-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-modal" onClick={e => e.stopPropagation()}>
            <div className="ai-modal-header">
              <h2>✨ AI Strategy Generator</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="ai-modal-body">
              <p className="ai-description">
                Choose a battle strategy or describe your own custom strategy.
                Powered by Google Gemini Flash ⚡
              </p>

              <div className="prompt-toggle">
                <button
                  className={`toggle-btn ${!useCustomPrompt ? 'active' : ''}`}
                  onClick={() => setUseCustomPrompt(false)}
                >
                  📋 Preset Strategies
                </button>
                <button
                  className={`toggle-btn ${useCustomPrompt ? 'active' : ''}`}
                  onClick={() => setUseCustomPrompt(true)}
                >
                  ✍️ Custom Prompt
                </button>
              </div>

              {!useCustomPrompt ? (
                <div className="strategy-grid">
                  {strategies.map(s => (
                    <button
                      key={s.id}
                      className={`strategy-card ${strategy === s.id ? 'active' : ''}`}
                      onClick={() => setStrategy(s.id)}
                    >
                      <span className="strategy-icon">{s.icon}</span>
                      <span className="strategy-name">{s.name}</span>
                      <span className="strategy-desc">{s.desc}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="custom-prompt-section">
                  <textarea
                    className="custom-prompt-input"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Example: Create a defensive strategy that prioritizes protecting archers while tanks advance slowly. Units should retreat to nearest mountain when HP is below 40%."
                    rows={5}
                  />
                  <p className="prompt-examples">
                    <strong>Examples:</strong><br/>
                    • "Focus on flanking maneuvers and attacking from behind"<br/>
                    • "Use drones for scouting, attack only when outnumbering enemy"<br/>
                    • "Stay near water terrain and kite enemies"
                  </p>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <div className="ai-modal-footer">
                <button 
                  onClick={handleGenerate} 
                  disabled={generating || (useCustomPrompt && !customPrompt.trim())}
                  className="generate-btn"
                >
                  {generating ? (
                    <>
                      <span className="spinner"></span>
                      Generating...
                    </>
                  ) : useCustomPrompt ? (
                    <>
                      ✨ Generate Custom Strategy
                    </>
                  ) : (
                    <>
                      ✨ Generate {strategies.find(s => s.id === strategy)?.name} Strategy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
