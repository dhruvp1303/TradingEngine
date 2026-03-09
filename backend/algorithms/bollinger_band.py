from models.database import SessionLocal, Price
import pandas as pd

def calculate_bb_signal(ticker, period=20, std_dev=2):
    session = SessionLocal()
    try:
        rows = session.query(Price).filter(
            Price.ticker == ticker,
            Price.timeframe == "1Day"
        ).order_by(Price.timestamp.desc()).limit(period).all()

        if len(rows) < period:
            return "NEUTRAL"

        closes = pd.Series([row.close for row in reversed(rows)])
        
        ma20 = closes.mean()
        std = closes.std()
        
        upper_band = ma20 + (std_dev * std)
        lower_band = ma20 - (std_dev * std)
        
        current_price = closes.iloc[-1]
        
        if current_price <= lower_band:
            return "BUY"
        elif current_price >= upper_band:
            return "SELL"
        else:
            return "NEUTRAL"

    except Exception as e:
        print(f"BB error for {ticker}: {e}")
        return "NEUTRAL"
    finally:
        session.close()