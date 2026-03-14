import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const COMPANY_NAMES = {
  "AAPL": "Apple Inc.", "MSFT": "Microsoft Corp.", "GOOGL": "Alphabet Inc.", "AMZN": "Amazon.com Inc.",
  "NVDA": "NVIDIA Corp.", "META": "Meta Platforms Inc.", "TSLA": "Tesla Inc.", "AMD": "Advanced Micro Devices",
  "INTC": "Intel Corp.", "CRM": "Salesforce Inc.", "JPM": "JPMorgan Chase", "BAC": "Bank of America",
  "GS": "Goldman Sachs", "MS": "Morgan Stanley", "WFC": "Wells Fargo", "BLK": "BlackRock Inc.",
  "AXP": "American Express", "V": "Visa Inc.", "MA": "Mastercard Inc.", "PYPL": "PayPal Holdings",
  "JNJ": "Johnson & Johnson", "UNH": "UnitedHealth Group", "PFE": "Pfizer Inc.", "ABBV": "AbbVie Inc.",
  "MRK": "Merck & Co.", "CVS": "CVS Health", "MDT": "Medtronic plc", "ABT": "Abbott Laboratories",
  "BMY": "Bristol-Myers Squibb", "AMGN": "Amgen Inc.", "XOM": "ExxonMobil Corp.", "CVX": "Chevron Corp.",
  "COP": "ConocoPhillips", "SLB": "SLB", "EOG": "EOG Resources", "PXD": "Pioneer Natural Resources",
  "MPC": "Marathon Petroleum", "VLO": "Valero Energy", "HAL": "Halliburton Co.", "OXY": "Occidental Petroleum",
  "WMT": "Walmart Inc.", "ETSY": "Etsy Inc.", "HD": "Home Depot Inc.", "NKE": "Nike Inc.",
  "SBUX": "Starbucks Corp.", "MCD": "McDonald's Corp.", "TGT": "Target Corp.", "COST": "Costco Wholesale",
  "LOW": "Lowe's Companies", "DG": "Dollar General"
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .stock-root {
    min-height: 100vh;
    background: #080808;
    background-image: radial-gradient(ellipse at 80% 0%, rgba(20, 60, 80, 0.12) 0%, transparent 60%);
    font-family: 'DM Sans', sans-serif;
    color: #e8e8e8;
  }

  .stock-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 60px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(8,8,8,0.85);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .back-btn {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    color: #888;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.05em;
  }

  .back-btn:hover {
    border-color: rgba(255,255,255,0.25);
    color: #fff;
  }

  .stock-nav-label {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #555;
    letter-spacing: 0.1em;
  }

  .stock-content {
    padding: 32px 40px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .stock-title-block {
    margin-bottom: 24px;
  }

  .stock-ticker {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px;
    font-weight: 400;
    color: #fff;
    letter-spacing: 2px;
    margin: 0;
    line-height: 1;
  }

  .stock-company-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #555;
    font-weight: 300;
    margin-top: 4px;
  }

  .chart-container {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 32px;
  }

  .overall-card {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .overall-inner {
    padding: 24px 56px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    text-align: center;
    min-width: 240px;
  }

  .overall-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #777;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .overall-signal {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px;
    letter-spacing: 3px;
    margin-bottom: 8px;
    line-height: 1;
  }

  .overall-confidence {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #666;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .last-updated {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #444;
    letter-spacing: 0.06em;
    margin-top: 4px;
  }

  .signal-cards-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  .signal-card {
    padding: 22px 20px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    text-align: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .signal-card:hover {
    background: rgba(255,255,255,0.05);
    transform: translateY(-2px);
  }

  .signal-card-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: #777;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .signal-card-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
    margin-bottom: 12px;
    line-height: 1;
  }

  .signal-card-hint {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: #444;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .explanation-card {
    padding: 28px 32px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
  }

  .explanation-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .explanation-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a855f7;
    flex-shrink: 0;
  }

  .explanation-title {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #a855f7;
    text-transform: uppercase;
  }

  .explanation-text {
    font-size: 15px;
    line-height: 1.8;
    color: #bbb;
    font-weight: 300;
    margin: 0;
  }

  .no-signal {
    margin-top: 32px;
    padding: 32px;
    border-radius: 12px;
    border: 1px dashed rgba(255,255,255,0.08);
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #555;
    letter-spacing: 0.05em;
  }

  .color-buy { color: #4ade80; }
  .color-sell { color: #f87171; }
  .color-neutral { color: #666; }

  .border-buy { border-color: rgba(74,222,128,0.2) !important; }
  .border-sell { border-color: rgba(248,113,113,0.2) !important; }

  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

function Stock() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [signals, setSignals] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [explanationLoading, setExplanationLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setExplanationLoading(true);

    axios.get(`${process.env.REACT_APP_API_URL}/signal/${ticker}`)      
      .then(response => setSignals(response.data))
      .catch(() => setSignals(null))
      .finally(() => setLoading(false));

    axios.get(`${process.env.REACT_APP_API_URL}/explanation/${ticker}`)
      .then(response => setExplanation(response.data.explanation))
      .catch(() => setExplanation(null))
      .finally(() => setExplanationLoading(false));
  }, [ticker]);

  function getColorClass(signal) {
    if (signal === 'BUY') return 'color-buy';
    if (signal === 'SELL') return 'color-sell';
    return 'color-neutral';
  }

  function getBorderClass(signal) {
    if (signal === 'BUY') return 'border-buy';
    if (signal === 'SELL') return 'border-sell';
    return '';
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const companyName = COMPANY_NAMES[ticker] || '';

  return (
    <>
      <style>{styles}</style>
      <div className="stock-root">

        <nav className="stock-navbar">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <div className="stock-nav-label">SIGNAL ENGINE · {ticker}</div>
          <div style={{ width: '80px' }} />
        </nav>

        <div className="stock-content">

          <div className="stock-title-block">
            <h1 className="stock-ticker">{ticker}</h1>
            {companyName && <div className="stock-company-name">{companyName}</div>}
          </div>

          <div className="chart-container">
            <iframe
              title="TradingView Chart"
              src={`https://www.tradingview.com/embed-widget/advanced-chart/?symbol=${ticker}&theme=dark&interval=D`}
              width="100%"
              height="500"
              frameBorder="0"
            />
          </div>

          {loading ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className="skeleton" style={{ width: '280px', height: '130px', borderRadius: '12px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '110px' }} />
                ))}
              </div>
              <div className="skeleton" style={{ height: '120px' }} />
            </div>
          ) : signals ? (
            <>
              <div className="overall-card">
                <div className={`overall-inner ${getBorderClass(signals.signal)}`}>
                  <div className="overall-label">Overall Signal</div>
                  <div className={`overall-signal ${getColorClass(signals.signal)}`}>{signals.signal}</div>
                  <div className="overall-confidence">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} style={{ marginRight: '4px', opacity: i < signals.confidence ? 1 : 0.15 }}>■</span>
                    ))}
                    {signals.confidence}/4 confidence
                  </div>
                  <div className="last-updated">Updated {formatDate(signals.created_at)}</div>
                </div>
              </div>

              <div className="signal-cards-grid">
                {[
                  { label: 'MA Crossover', value: signals.ma_signal, type: 'ma' },
                  { label: 'RSI', value: signals.rsi_signal, type: 'rsi' },
                  { label: 'Bollinger Bands', value: signals.bb_signal, type: 'bb' },
                  { label: 'News Sentiment', value: signals.sentiment_signal, type: 'sentiment' },
                ].map(({ label, value, type }) => (
                  <div
                    key={label}
                    className={`signal-card ${getBorderClass(value)}`}
                    onClick={() => navigate(`/signal-info/${type}`)}
                  >
                    <div className="signal-card-label">{label}</div>
                    <div className={`signal-card-value ${getColorClass(value)}`}>{value}</div>
                    <div className="signal-card-hint">Learn more →</div>
                  </div>
                ))}
              </div>

              {explanationLoading ? (
                <div className="skeleton" style={{ height: '120px' }} />
              ) : explanation ? (
                <div className="explanation-card">
                  <div className="explanation-header">
                    <div className="explanation-dot" />
                    <div className="explanation-title">AI Analysis</div>
                  </div>
                  <p className="explanation-text">{explanation}</p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="no-signal">
              No signal available for {ticker} yet · Check back after market close
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default Stock;