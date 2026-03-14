import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .home-root {
    min-height: 100vh;
    background: #080808;
    background-image: radial-gradient(ellipse at 20% 0%, rgba(30, 80, 40, 0.15) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 100%, rgba(20, 40, 80, 0.15) 0%, transparent 60%);
    font-family: 'DM Sans', sans-serif;
    color: #e8e8e8;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 60px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(8,8,8,0.85);
  }

  .navbar-logo {
    font-family: 'DM Sans', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    line-height: 1;
  }

  .navbar-logo span { color: #4ade80; }

  .navbar-meta {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #666;
    letter-spacing: 0.05em;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 420px;
    min-height: calc(100vh - 60px);
  }

  .left-panel {
    padding: 40px;
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .right-panel {
    padding: 40px;
    background: rgba(255,255,255,0.01);
  }

  .panel-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #777;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .panel-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px;
    color: #fff;
    margin: 0 0 16px 0;
    letter-spacing: 1px;
    line-height: 1;
  }

  .stats-strip {
    display: flex;
    gap: 24px;
    margin-bottom: 28px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px;
    width: fit-content;
  }

  .stat-item {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ticker-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ticker-btn {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 16px;
    background: rgba(255,255,255,0.03);
    color: #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .ticker-btn:hover {
    background: rgba(255,255,255,0.07);
    color: #fff;
    transform: translateY(-1px);
  }

  .ticker-signal-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .signals-table {
    width: 100%;
    border-collapse: collapse;
  }

  .signals-table th {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #777;
    text-align: left;
    padding: 0 12px 14px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .signals-table td {
    padding: 14px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 14px;
  }

  .signal-row {
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .signal-row:hover { background: rgba(255,255,255,0.03); }

  .ticker-cell {
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    letter-spacing: 0.05em;
  }

  .signal-badge {
    display: inline-block;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 4px;
    letter-spacing: 0.08em;
  }

  .signal-buy { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
  .signal-sell { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
  .signal-neutral { background: rgba(255,255,255,0.05); color: #999; border: 1px solid rgba(255,255,255,0.1); }

  .glow-buy-2 { box-shadow: 0 0 6px rgba(74,222,128,0.3); }
  .glow-buy-3 { box-shadow: 0 0 12px rgba(74,222,128,0.55); }
  .glow-buy-4 { box-shadow: 0 0 20px rgba(74,222,128,0.85), 0 0 40px rgba(74,222,128,0.3); }
  .glow-sell-2 { box-shadow: 0 0 6px rgba(248,113,113,0.3); }
  .glow-sell-3 { box-shadow: 0 0 12px rgba(248,113,113,0.55); }
  .glow-sell-4 { box-shadow: 0 0 20px rgba(248,113,113,0.85), 0 0 40px rgba(248,113,113,0.3); }

  .confidence-dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
  }

  .dot.filled-buy { background: #4ade80; }
  .dot.filled-sell { background: #f87171; }

  .date-tag {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
  }

  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

function Home() {
  const navigate = useNavigate();
  const [tickers, setTickers] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_URL}/tickers`),
      axios.get(`${process.env.REACT_APP_API_URL}/signals`)
    ]).then(([tickersRes, signalsRes]) => {
      setTickers(tickersRes.data);
      setSignals(signalsRes.data);
      setLoading(false);
    });
  }, []);

  function getDaysAgo(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const signalDate = new Date(dateStr);
    signalDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - signalDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { label: 'Today', color: '#4ade80' };
    if (diffDays === 1) return { label: 'Yesterday', color: '#777' };
    return { label: `${diffDays}d ago`, color: '#555' };
  }

  function getGlowClass(signal, confidence) {
    if (signal === "BUY") return `glow-buy-${Math.min(confidence, 4)}`;
    if (signal === "SELL") return `glow-sell-${Math.min(confidence, 4)}`;
    return "";
  }

  function getSignalClass(signal) {
    if (signal === 'BUY') return 'signal-badge signal-buy';
    if (signal === 'SELL') return 'signal-badge signal-sell';
    return 'signal-badge signal-neutral';
  }

  function getBorderColor(signal) {
    if (signal === 'BUY') return 'rgba(74,222,128,0.4)';
    if (signal === 'SELL') return 'rgba(248,113,113,0.4)';
    return 'rgba(255,255,255,0.08)';
  }

  function getGlowColor(signal) {
    if (signal === 'BUY') return '0 0 16px rgba(74,222,128,0.25)';
    if (signal === 'SELL') return '0 0 16px rgba(248,113,113,0.25)';
    return '0 0 16px rgba(255,255,255,0.08)';
  }

  function getDotColor(signal) {
    if (signal === 'BUY') return '#4ade80';
    if (signal === 'SELL') return '#f87171';
    return 'transparent';
  }

  const buyCount = signals.filter(s => s.signal === 'BUY').length;
  const sellCount = signals.filter(s => s.signal === 'SELL').length;
  const noSignalCount = 50 - signals.length;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  return (
    <>
      <style>{styles}</style>
      <div className="home-root">

        <nav className="navbar">
          <div className="navbar-logo">Signal<span>Engine</span></div>
          <div className="navbar-meta">{timeStr} · {signals.length} active signals</div>
        </nav>

        <div className="main-layout">

          {/* Left — Ticker Grid */}
          <div className="left-panel">
            <div className="panel-label">Coverage Universe</div>
            <h2 className="panel-title">50 Equities</h2>

            {/* Stats Strip */}
            {!loading && (
              <div className="stats-strip">
                <div className="stat-item">
                  <div className="stat-dot" style={{ background: '#4ade80' }} />
                  <span style={{ color: '#4ade80' }}>{buyCount} BUY</span>
                </div>
                <div className="stat-item">
                  <div className="stat-dot" style={{ background: '#f87171' }} />
                  <span style={{ color: '#f87171' }}>{sellCount} SELL</span>
                </div>
                <div className="stat-item">
                  <div className="stat-dot" style={{ background: '#444' }} />
                  <span style={{ color: '#555' }}>{noSignalCount} No Signal</span>
                </div>
              </div>
            )}

            {/* Ticker Buttons */}
            <div className="ticker-grid">
              {loading
                ? [...Array(50)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ width: '70px', height: '38px' }} />
                  ))
                : tickers.map(ticker => {
                    const tickerSignal = signals.find(s => s.ticker === ticker);
                    const borderColor = getBorderColor(tickerSignal?.signal);
                    const glowColor = getGlowColor(tickerSignal?.signal);
                    const dotColor = getDotColor(tickerSignal?.signal);
                    return (
                      <button
                        key={ticker}
                        className="ticker-btn"
                        onClick={() => navigate(`/stock/${ticker}`)}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = glowColor;
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.color = '#ccc';
                        }}
                        style={{ border: `1px solid ${borderColor}` }}
                      >
                        {tickerSignal && (
                          <div className="ticker-signal-dot" style={{ background: dotColor }} />
                        )}
                        {ticker}
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* Right — Signals Table */}
          <div className="right-panel">
            <div className="panel-label">Daily Output</div>
            <h2 className="panel-title">Latest Signals</h2>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '44px', borderRadius: '8px' }} />
                ))}
              </div>
            ) : (
              <table className="signals-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Signal</th>
                    <th>Conf</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map(s => {
                    const { label, color } = getDaysAgo(s.created_at);
                    const dotClass = s.signal === 'BUY' ? 'filled-buy' : s.signal === 'SELL' ? 'filled-sell' : '';
                    return (
                      <tr key={s.ticker} className="signal-row" onClick={() => navigate(`/stock/${s.ticker}`)}>
                        <td className="ticker-cell">{s.ticker}</td>
                        <td><span className={`${getSignalClass(s.signal)} ${getGlowClass(s.signal, s.confidence)}`}>{s.signal}</span></td>
                        <td>
                          <div className="confidence-dots">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className={`dot ${i < s.confidence ? dotClass : ''}`} />
                            ))}
                          </div>
                        </td>
                        <td className="date-tag" style={{ color }}>{label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default Home;