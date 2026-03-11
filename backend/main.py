import alpaca_trade_api as tradeapi
from datetime import datetime
from dotenv import load_dotenv
import os
import time

from models.database import SessionLocal, Price, Signal

from algorithms.ma_crossover import calculate_ma_signal
from algorithms.rsi import calculate_rsi_signal
from algorithms.bollinger_band import calculate_bb_signal

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

ran_today = None  # tracks the last date we pulled data

def is_market_closing():
    """Returns True only in the 1-minute window when market just closed."""
    try:
        clock = api.get_clock()
        # next_close is a datetime — if we're within 1 min after close, fire
        seconds_since_close = (datetime.now(clock.next_close.tzinfo) - clock.next_close).total_seconds()
        return 0 <= seconds_since_close <= 60
    except Exception as e:
        print(f"Clock error: {e}")
        return False

def fetch_and_store_prices():
    session = SessionLocal()
    try:
        for ticker in WATCHLIST:
            bars = api.get_bars(ticker, "1Day", limit=1, feed="iex").df
            if bars.empty:
                print(f"No bar data for {ticker}, skipping.")
                continue
            row = bars.iloc[-1]
            price = Price(
                ticker=ticker,
                open=float(row["open"]),
                high=float(row["high"]),
                low=float(row["low"]),
                close=float(row["close"]),
                volume=float(row["volume"]),
                timestamp=datetime.now(),
                timeframe="1Day"
            )
            session.add(price)
        session.commit()
        print(f"Prices saved at {datetime.now()}")
    except Exception as e:
        print(f"Error fetching prices: {e}")
        session.rollback()
    finally:
        session.close()

def calculate_confidence(ma_signal, rsi_signal, bb_signal):
    signals = [ma_signal, rsi_signal, bb_signal]
    buy_count = signals.count("BUY")
    sell_count = signals.count("SELL")
    if buy_count == 3:
        return "BUY", 3
    elif sell_count == 3:
        return "SELL", 3
    elif buy_count == 2:
        return "BUY", 2
    elif sell_count == 2:
        return "SELL", 2
    else:
        return "NEUTRAL", 1

def generate_signals():
    session = SessionLocal()
    try:
        for ticker in WATCHLIST:
            ma_signal = calculate_ma_signal(ticker)
            rsi_signal = calculate_rsi_signal(ticker)
            bb_signal = calculate_bb_signal(ticker)
            overall_signal, confidence = calculate_confidence(ma_signal, rsi_signal, bb_signal)
            if confidence >= 2:
                signal = Signal(
                    ticker=ticker,
                    signal=overall_signal,
                    ma_signal=ma_signal,
                    rsi_signal=rsi_signal,
                    bb_signal=bb_signal,
                    confidence=confidence,
                    price=0.0,
                    created_at=datetime.now()
                )
                session.add(signal)
                session.commit()
                print(f"Signal saved: {ticker} {overall_signal} confidence {confidence}")
    except Exception as e:
        print(f"Error generating signals: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    print("Trading engine started...")
    while True:
        today = datetime.now().date()
        if is_market_closing() and ran_today != today:
            print(f"Market just closed — fetching data for {today}...")
            fetch_and_store_prices()
            generate_signals()
            ran_today = today
            print("Done for today.")
        time.sleep(60)  # check once per minute