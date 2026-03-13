import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Stock() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [signals, setSignals] = useState(null);
  const [explanation, setExplanation] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/signal/${ticker}`)
      .then(response => setSignals(response.data))
      .catch(() => setSignals(null));

    axios.get(`http://localhost:8000/explanation/${ticker}`)
      .then(response => setExplanation(response.data.explanation))
      .catch(() => setExplanation(null));
  }, [ticker]);

  function getSignalColor(signal) {
    if (signal === 'BUY') return 'green';
    if (signal === 'SELL') return 'red';
    return 'grey';
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{ticker}</h1>

      {/* TradingView Chart */}
      <iframe
        title="TradingView Chart"
        src={`https://www.tradingview.com/embed-widget/advanced-chart/?symbol=${ticker}&theme=dark&interval=D`}
        width="100%"
        height="500"
        frameBorder="0"
      />

      {/* Signal Cards */}
      {signals ? (
        <div style={{ marginTop: '24px' }}>

          {/* Overall Signal - centered above the rest */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              padding: '20px 40px',
              borderRadius: '8px',
              border: '2px solid #555',
              backgroundColor: '#1a1a1a',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>Overall Signal</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: getSignalColor(signals.signal) }}>{signals.signal}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Confidence: {signals.confidence}/4</div>
            </div>
          </div>

          {/* 4 Signal Cards - clickable */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'MA Crossover', value: signals.ma_signal, type: 'ma' },
              { label: 'RSI', value: signals.rsi_signal, type: 'rsi' },
              { label: 'Bollinger Bands', value: signals.bb_signal, type: 'bb' },
              { label: 'News Sentiment', value: signals.sentiment_signal, type: 'sentiment' },
            ].map(({ label, value, type }) => (
              <div
                key={label}
                onClick={() => navigate(`/signal-info/${type}`)}
                style={{
                  flex: '1',
                  minWidth: '150px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  backgroundColor: '#111',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
              >
                <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getSignalColor(value) }}>{value}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>Click to learn more</div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <p style={{ color: '#aaa', marginTop: '20px' }}>No signal available for {ticker} yet. Check back after market close.</p>
      )}

      {/* AI Explanation */}
      {explanation && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #333',
          backgroundColor: '#111',
          lineHeight: '1.6',
          color: '#ccc'
        }}>
          <h3 style={{ color: 'white', marginBottom: '12px' }}>AI Analysis</h3>
          <p>{explanation}</p>
        </div>
      )}

    </div>
  );
}

export default Stock;