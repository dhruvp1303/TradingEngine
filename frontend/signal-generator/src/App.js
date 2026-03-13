import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Stock from './pages/Stock';
import SignalInfo from './pages/SignalInfo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock/:ticker" element={<Stock />} />
        <Route path="/signal-info/:type" element={<SignalInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;