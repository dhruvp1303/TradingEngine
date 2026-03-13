import { useParams, useNavigate } from 'react-router-dom';

const SIGNAL_INFO = {
  ma: {
    title: 'MA Crossover (Moving Average Crossover)',
    subtitle: 'Trend Following Strategy',
    color: '#4a9eff',
    howItWorks: 'The MA Crossover strategy uses two moving averages — a 20-day and a 50-day. A moving average smooths out daily price fluctuations by averaging the closing price over a set number of days.',
    signals: [
      { label: 'BUY', description: 'The 20-day average crosses ABOVE the 50-day average — short term momentum is stronger than the long term trend, suggesting the stock is gaining upward momentum.' },
      { label: 'SELL', description: 'The 20-day average crosses BELOW the 50-day average — short term momentum is weaker than the long term trend, suggesting the stock may be losing steam.' },
      { label: 'NEUTRAL', description: 'The two averages are close together with no clear crossover — no strong trend in either direction.' },
    ],
    strengths: 'Works well in trending markets. Easy to understand and implement. Reduces noise from daily price swings.',
    weaknesses: 'Lags behind price movements since it uses historical data. Can produce false signals in sideways or choppy markets.',
  },
  rsi: {
    title: 'RSI (Relative Strength Index)',
    subtitle: 'Momentum Oscillator',
    color: '#f4a261',
    howItWorks: 'RSI measures the speed and magnitude of recent price changes on a scale of 0 to 100. It compares average gains vs average losses over the last 14 days to determine if a stock is overbought or oversold.',
    signals: [
      { label: 'BUY', description: 'RSI drops below 30 — the stock is considered oversold, meaning it may have been sold too aggressively and could bounce back up.' },
      { label: 'SELL', description: 'RSI rises above 70 — the stock is considered overbought, meaning buyers may have pushed the price too high and a pullback could follow.' },
      { label: 'NEUTRAL', description: 'RSI is between 30 and 70 — the stock is trading in a normal range with no extreme momentum in either direction.' },
    ],
    strengths: 'Great at identifying potential reversals. Works well in range-bound markets. Quick to react to price changes.',
    weaknesses: 'In strong trending markets, RSI can stay overbought or oversold for extended periods without reversing. Best used alongside other indicators.',
  },
  bb: {
    title: 'Bollinger Bands',
    subtitle: 'Volatility-Based Strategy',
    color: '#2ec4b6',
    howItWorks: 'Bollinger Bands consist of three lines: a 20-day moving average in the middle, and two bands placed 2 standard deviations above and below it. The bands widen when volatility is high and narrow when it is low.',
    signals: [
      { label: 'BUY', description: 'Price touches or drops below the lower band — the stock has moved unusually far below its average, suggesting it may be undervalued and due for a bounce.' },
      { label: 'SELL', description: 'Price touches or rises above the upper band — the stock has moved unusually far above its average, suggesting it may be overextended and due for a pullback.' },
      { label: 'NEUTRAL', description: 'Price is trading between the two bands — within the normal expected range, no clear signal.' },
    ],
    strengths: 'Adapts to market volatility automatically. Good at identifying extremes in price movement. Works across different timeframes.',
    weaknesses: 'Price can "walk the band" in strong trends, staying near the upper or lower band for long periods. Not great as a standalone signal.',
  },
  sentiment: {
    title: 'News Sentiment',
    subtitle: 'AI-Powered News Analysis',
    color: '#a855f7',
    howItWorks: 'Each day, the latest 5 news headlines for the stock are fetched from NewsAPI. These headlines are passed to Groq\'s LLaMA 3.3 AI model, which reads them and determines whether the overall news tone is positive, negative, or neutral for the stock.',
    signals: [
      { label: 'BUY', description: 'The headlines are clearly positive — such as strong earnings, new product launches, analyst upgrades, or favorable market conditions.' },
      { label: 'SELL', description: 'The headlines are clearly negative — such as earnings misses, regulatory issues, executive departures, or broader sector headwinds.' },
      { label: 'NEUTRAL', description: 'The headlines are mixed, unrelated to stock performance, or don\'t provide enough signal to lean clearly in either direction.' },
    ],
    strengths: 'Captures real-world events that pure price-based indicators miss. Adds context beyond just chart patterns. Updated daily with fresh news.',
    weaknesses: 'News can be noisy or misleading. AI interpretation is not always perfect. Headlines don\'t always reflect the full story.',
  },
};

function SignalInfo() {
  const { type } = useParams();
  const navigate = useNavigate();
  const info = SIGNAL_INFO[type];

  if (!info) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Signal type not found.</h2>
        <button onClick={() => navigate(-1)} style={{ marginTop: '16px', padding: '10px 20px', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: '1px solid #333',
          color: '#aaa',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '32px',
          fontSize: '14px'
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ borderLeft: `4px solid ${info.color}`, paddingLeft: '16px', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 4px 0' }}>{info.title}</h1>
        <p style={{ color: '#aaa', margin: 0 }}>{info.subtitle}</p>
      </div>

      {/* How It Works */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: info.color, marginBottom: '12px' }}>How It Works</h3>
        <p style={{ color: '#ccc', lineHeight: '1.7' }}>{info.howItWorks}</p>
      </div>

      {/* Signal Meanings */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: info.color, marginBottom: '12px' }}>What Each Signal Means</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {info.signals.map(({ label, description }) => (
            <div key={label} style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #333',
              backgroundColor: '#111',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              <span style={{
                fontWeight: 'bold',
                color: label === 'BUY' ? 'green' : label === 'SELL' ? 'red' : 'grey',
                minWidth: '60px',
                fontSize: '16px'
              }}>
                {label}
              </span>
              <p style={{ color: '#ccc', margin: 0, lineHeight: '1.6' }}>{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #1a3a1a', backgroundColor: '#0a1a0a' }}>
          <h4 style={{ color: 'lightgreen', marginBottom: '8px' }}>Strengths</h4>
          <p style={{ color: '#ccc', margin: 0, lineHeight: '1.6', fontSize: '14px' }}>{info.strengths}</p>
        </div>
        <div style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #3a1a1a', backgroundColor: '#1a0a0a' }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '8px' }}>Weaknesses</h4>
          <p style={{ color: '#ccc', margin: 0, lineHeight: '1.6', fontSize: '14px' }}>{info.weaknesses}</p>
        </div>
      </div>

    </div>
  );
}

export default SignalInfo;