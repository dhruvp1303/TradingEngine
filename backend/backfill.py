import alpaca_trade_api as tradeapi
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from models.database import SessionLocal, Price

load_dotenv()

API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
BASE_URL = os.getenv("ALPACA_BASE_URL")

api = tradeapi.REST(API_KEY, SECRET_KEY, BASE_URL)

WATCHLIST = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AMD", "INTC", "CRM",
    "JPM", "BAC", "GS", "MS", "WFC", "BLK", "AXP", "V", "MA", "PYPL",
    "JNJ", "UNH", "PFE", "ABBV", "MRK", "CVS", "MDT", "ABT", "BMY", "AMGN",
    "XOM", "CVX", "COP", "SLB", "EOG", "PXD", "MPC", "VLO", "HAL", "OXY",
    "WMT", "ETSY", "HD", "NKE", "SBUX", "MCD", "TGT", "COST", "LOW", "DG"
]

def backfill_historical_data():
    session = SessionLocal()
    try:
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=730)).strftime("%Y-%m-%d")

        for ticker in WATCHLIST:
            print(f"Getting historical data for {ticker} from {start_date} to {end_date}")
            try:
                bars = api.get_bars(ticker, "1Day", start=start_date, end=end_date, feed="iex").df
                for timestamp, row in bars.iterrows():
                    price = Price(
                        ticker=ticker,
                        open=float(row["open"]),
                        high=float(row["high"]),
                        low=float(row["low"]),
                        close=float(row["close"]),
                        volume=float(row["volume"]),
                        timestamp=timestamp,
                        timeframe="1Day"  # Fix: was missing, algorithms filter on this
                    )
                    session.add(price)

                session.commit()
                print(f"Historical data for {ticker} saved")

            except Exception as e:
                print(f"Error occurred while fetching data for {ticker}: {e}")
                session.rollback()

    finally:
        session.close()

if __name__ == "__main__":
    backfill_historical_data()
    print("Backfill done")