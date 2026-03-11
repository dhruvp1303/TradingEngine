from models.database import SessionLocal, Price
import pandas as pd

def calculate_rsi_signal(ticker, period=14, as_of_date=None):
    session = SessionLocal()
    try:
        rows = session.query(Price).filter(
            Price.ticker == ticker,
            Price.timeframe == "1Day",
            Price.timestamp <= as_of_date if as_of_date else True
        ).order_by(Price.timestamp.desc()).limit(period + 1).all()

        if len(rows) < period + 1:
            return "NEUTRAL"

        closes = pd.Series([row.close for row in reversed(rows)])
        
        delta = closes.diff()
        
        gains = delta.where(delta > 0, 0)
        losses = -delta.where(delta < 0, 0)
        
        avg_gain = gains.tail(period).mean()
        avg_loss = losses.tail(period).mean()
        
        if avg_loss == 0:
            return "BUY"
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        if rsi < 30:
            return "BUY"
        elif rsi > 70:
            return "SELL"
        else:
            return "NEUTRAL"

    except Exception as e:
        print(f"RSI error for {ticker}: {e}")
        return "NEUTRAL"
    finally:
        session.close()