import time
import alpaca_trade_api as tradeapi
from datetime import datetime
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
    "WMT", "AMZN", "HD", "NKE", "SBUX", "MCD", "TGT", "COST", "LOW", "DG"
]

def fetch_and_store_prices():
    session = SessionLocal()
    try:
        for ticker in WATCHLIST:
            bars = api.get_latest_bar(ticker)
            price = Price(
                ticker=ticker,
                open=bars.o,
                high=bars.h,
                low=bars.l,
                close=bars.c,
                volume=bars.v,
                timestamp=datetime.now(),
                timeframe="5Min"

            )
            session.add(price)
        session.commit()
        print(f"Prices saved at {datetime.now()}")
    except Exception as e:
        print(f"Error fetching prices: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    print("Trading engine started...")
    while True:
        fetch_and_store_prices()
        time.sleep(300)