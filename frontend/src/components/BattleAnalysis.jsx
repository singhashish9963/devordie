import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trophy, TrendingUp, TrendingDown, Target, Shield, Zap, Brain, Code, RefreshCw, AlertCircle } from 'lucide-react';
import './BattleAnalysis.css';

/**
 * BattleAnalysis Component
 * Displays AI-powered post-battle analysis using Gemini 2.0 Flash
 */
const BattleAnalysis = ({ battleId, playerRole, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalysis();
  }, [battleId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/war/${battleId}/analysis`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analysis');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/war/${battleId}/analysis/regenerate`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to regenerate analysis');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Failed to regenerate analysis:', err);
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="battle-analysis-modal">
        <div className="battle-analysis-container">
          <div className="analysis-loading">
            <Brain className="loading-icon spinning" size={48} />
            <h3>🤖 Analyzing Battle with Gemini 2.0 Flash...</h3>
            <p>Reviewing strategies, tactics, and performance</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="battle-analysis-modal">
        <div className="battle-analysis-container">
          <div className="analysis-error">
            <AlertCircle size={48} />
            <h3>Failed to Load Analysis</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={fetchAnalysis} className="btn-retry">
                <RefreshCw size={16} /> Retry
              </button>
              <button onClick={onClose} className="btn-close">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const playerData = playerRole === 'player1' ? analysis.player1 : analysis.player2;
  const opponentData = playerRole === 'player1' ? analysis.player2 : analysis.player1;
  const isWinner = analysis.winner === playerRole;
  const isDraw = analysis.winner === 'draw';

  return (
    <div className="battle-analysis-modal">
      <div className="battle-analysis-container">
        {/* Header */}
        <div className={`analysis-header ${isWinner ? 'victory' : isDraw ? 'draw' : 'defeat'}`}>
          <div className="header-content">
            <div className="battle-result">
              {isWinner ? (
                <>
                  <Trophy size={32} />
                  <h2>Victory Analysis</h2>
                </>
              ) : isDraw ? (
                <>
                  <Target size={32} />
                  <h2>Draw Analysis</h2>
                </>
              ) : (
                <>
                  <Shield size={32} />
                  <h2>Defeat Analysis</h2>
                </>
              )}
            </div>
            <div className="battle-info">
              <span>Battle: {analysis.battleCode}</span>
              <span>Ticks: {analysis.ticks}</span>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {/* Summary */}
        <div className="analysis-summary">
          <Brain size={24} />
          <p>{playerData.summary}</p>
        </div>

        {/* Tabs */}
        <div className="analysis-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <Target size={18} />
            Overview
          </button>
          <button 
            className={activeTab === 'strategy' ? 'active' : ''}
            onClick={() => setActiveTab('strategy')}
          >
            <Brain size={18} />
            Strategy
          </button>
          <button 
            className={activeTab === 'improvements' ? 'active' : ''}
            onClick={() => setActiveTab('improvements')}
          >
            <TrendingUp size={18} />
            Improvements
          </button>
          <button 
            className={activeTab === 'tactical' ? 'active' : ''}
            onClick={() => setActiveTab('tactical')}
          >
            <Zap size={18} />
            Tactical Tips
          </button>
        </div>

        {/* Content */}
        <div className="analysis-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              {/* Strengths */}
              <section className="analysis-section">
                <h3><CheckCircle size={20} className="success" /> Your Strengths</h3>
                <ul className="strength-list">
                  {playerData.strengths?.map((strength, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} className="success" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Weaknesses */}
              <section className="analysis-section">
                <h3><XCircle size={20} className="warning" /> Areas for Improvement</h3>
                <ul className="weakness-list">
                  {playerData.weaknesses?.map((weakness, idx) => (
                    <li key={idx}>
                      <XCircle size={16} className="warning" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'strategy' && playerData.strategyAnalysis && (
            <div className="tab-content">
              <section className="analysis-section">
                <h3><Brain size={20} /> Your Approach</h3>
                <p className="strategy-text">{playerData.strategyAnalysis.yourApproach}</p>
              </section>

              <section className="analysis-section">
                <h3><Shield size={20} /> Opponent's Approach</h3>
                <p className="strategy-text">{playerData.strategyAnalysis.opponentApproach}</p>
              </section>

              <section className="analysis-section">
                <h3><Target size={20} /> Key Differences</h3>
                <p className="strategy-text">{playerData.strategyAnalysis.keyDifferences}</p>
              </section>

              <section className="analysis-section highlight">
                <h3><Zap size={20} /> What Could Have Been Done</h3>
                <p className="strategy-text">{playerData.whatCouldHaveBeenDone}</p>
              </section>
            </div>
          )}

          {activeTab === 'improvements' && (
            <div className="tab-content">
              {playerData.improvements?.map((improvement, idx) => (
                <section key={idx} className="improvement-card">
                  <div className="improvement-header">
                    <span className="improvement-category">{improvement.category}</span>
                  </div>
                  <div className="improvement-body">
                    <h4>Issue:</h4>
                    <p>{improvement.issue}</p>
                    <h4>Suggestion:</h4>
                    <p>{improvement.suggestion}</p>
                    {improvement.codeExample && (
                      <>
                        <h4><Code size={16} /> Code Example:</h4>
                        <pre className="code-example">{improvement.codeExample}</pre>
                      </>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeTab === 'tactical' && (
            <div className="tab-content">
              <section className="analysis-section">
                <h3><Zap size={20} /> Tactical Advice</h3>
                <ul className="tactical-list">
                  {playerData.tacticalAdvice?.map((advice, idx) => (
                    <li key={idx}>
                      <Zap size={16} />
                      {advice}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="analysis-footer">
          <button 
            onClick={handleRegenerate} 
            className="btn-regenerate"
            disabled={regenerating}
          >
            <RefreshCw size={16} className={regenerating ? 'spinning' : ''} />
            {regenerating ? 'Regenerating...' : 'Regenerate Analysis'}
          </button>
          <button onClick={onClose} className="btn-done">Done</button>
        </div>
      </div>
    </div>
  );
};

export default BattleAnalysis;
