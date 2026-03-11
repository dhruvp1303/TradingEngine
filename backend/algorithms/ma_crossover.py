from models.database import SessionLocal, Price
import pandas as pd

def calculate_ma_signal(ticker, as_of_date=None):    
    session = SessionLocal()
    try:
        rows = session.query(Price).filter(
            Price.ticker == ticker,
            Price.timeframe == "1Day",
            Price.timestamp <= as_of_date if as_of_date else True

        ).order_by(Price.timestamp.desc()).limit(50).all()

        if len(rows) < 50:
            return "NEUTRAL"

        closes = pd.Series([row.close for row in reversed(rows)])

        ma20 = closes.tail(20).mean()
        ma50 = closes.tail(50).mean()

        if ma20 > ma50:
            return "BUY"
        elif ma20 < ma50:
            return "SELL"
        else:
            return "NEUTRAL"

    except Exception as e:
        print(f"MA error for {ticker}: {e}")
        return "NEUTRAL"
    finally:
        session.close()