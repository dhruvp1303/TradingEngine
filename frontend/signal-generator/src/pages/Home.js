import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [tickers, setTickers] = useState([]);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/tickers')
      .then(response => setTickers(response.data));

    axios.get('http://localhost:8000/signals')
      .then(response => setSignals(response.data));
  }, []);

  function getDaysAgo(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const signalDate = new Date(dateStr);
    signalDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - signalDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'Today', color: 'lightgreen' };
    if (diffDays === 1) return { label: 'Yesterday', color: '#888' };
    return { label: `${diffDays} days ago`, color: '#666' };
  }

  function getSignalColor(signal) {
    if (signal === 'BUY') return 'green';
    if (signal === 'SELL') return 'red';
    return 'grey';
  }

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '24px' }}>

      {/* Left — Ticker Grid */}
      <div style={{ flex: '1' }}>
        <h2>Stocks</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tickers.map(ticker => (
            <button
              key={ticker}
              onClick={() => navigate(`/stock/${ticker}`)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#111',
                color: 'white',
                border: '1px solid #333',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Right — Signals Table */}
      <div style={{ flex: '1' }}>
        <h2>Latest Signals</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', color: '#aaa', fontSize: '13px' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Ticker</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Signal</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Confidence</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {signals.map(s => {
              const { label, color } = getDaysAgo(s.created_at);
              return (
                <tr
                  key={s.ticker}
                  onClick={() => navigate(`/stock/${s.ticker}`)}
                  style={{
                    borderBottom: '1px solid #222',
                    cursor: 'pointer',
                    backgroundColor: label === 'Today' ? '#0a1a0a' : '#111'
                  }}
                >
                  <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{s.ticker}</td>
                  <td style={{ padding: '10px 8px', color: getSignalColor(s.signal), fontWeight: 'bold' }}>{s.signal}</td>
                  <td style={{ padding: '10px 8px', color: '#aaa' }}>{s.confidence}/4</td>
                  <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                    <span style={{ color }}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Home;