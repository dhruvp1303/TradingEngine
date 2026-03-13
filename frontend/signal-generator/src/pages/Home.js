import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [tickers, setTickers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/tickers')
      .then(response => setTickers(response.data))
  }, []);

  return (
    <div className="home">
      <h1>Welcome to the Stock Signal Generator</h1>
        {tickers.map(ticker => (
          <button key={ticker} onClick={() => navigate(`/stock/${ticker}`)}>
            {ticker}
          </button>
        ))}
    </div>
  );
}

export default Home;