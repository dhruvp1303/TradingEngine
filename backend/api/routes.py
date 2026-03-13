from fastapi import APIRouter, HTTPException
from models.database import SessionLocal, Signal, Price
from ai.explanations import generate_explanation

router = APIRouter()

@router.get("/signal/{ticker}")
def get_signal(ticker: str):
    session = SessionLocal()
    try:
        signal = session.query(Signal).filter(
            Signal.ticker == ticker.upper()
        ).order_by(Signal.created_at.desc()).first()

        if not signal:
            raise HTTPException(status_code=404, detail=f"No signal found for {ticker}")

        return {
            "ticker": signal.ticker,
            "signal": signal.signal,
            "ma_signal": signal.ma_signal,
            "rsi_signal": signal.rsi_signal,
            "bb_signal": signal.bb_signal,
            "sentiment_signal": signal.sentiment_signal,
            "confidence": signal.confidence,
            "created_at": signal.created_at
        }
    finally:
        session.close()

@router.get("/explanation/{ticker}")
def get_explanation(ticker: str):
    session = SessionLocal()
    try:
        signal = session.query(Signal).filter(
            Signal.ticker == ticker.upper()
        ).order_by(Signal.created_at.desc()).first()

        if not signal:
            raise HTTPException(status_code=404, detail=f"No signal found for {ticker}")

        explanation = generate_explanation(
            ticker=signal.ticker,
            ma_signal=signal.ma_signal,
            rsi_signal=signal.rsi_signal,
            bb_signal=signal.bb_signal,
            sentiment_signal=signal.sentiment_signal
        )

        return {
            "ticker": signal.ticker,
            "explanation": explanation
        }
    finally:
        session.close()

@router.get("/signals")
def get_all_signals():
    session = SessionLocal()
    try:
        signals = session.query(Signal).order_by(
            Signal.created_at.desc(),
            Signal.confidence.desc()
        ).limit(50).all()

        seen = set()
        results = []
        for s in signals:
            if s.ticker not in seen:
                seen.add(s.ticker)
                results.append({
                    "ticker": s.ticker,
                    "signal": s.signal,
                    "confidence": s.confidence,
                    "created_at": s.created_at
                })

        return results
    finally:
        session.close()

@router.get("/prices/{ticker}")
def get_prices(ticker: str):
    session = SessionLocal()
    try:
        prices = session.query(Price).filter(
            Price.ticker == ticker.upper(),
            Price.timeframe == "1Day"
        ).order_by(Price.timestamp.desc()).limit(30).all()

        if not prices:
            raise HTTPException(status_code=404, detail=f"No prices found for {ticker}")

        return [
            {
                "timestamp": p.timestamp,
                "open": p.open,
                "high": p.high,
                "low": p.low,
                "close": p.close,
                "volume": p.volume
            }
            for p in reversed(prices)
        ]
    finally:
        session.close()