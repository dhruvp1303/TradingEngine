import alpaca_trade_api as tradeapi
from datetime import datetime
from dotenv import load_dotenv
import os
import time

from models.database import SessionLocal, Price, Signal

from algorithms.ma_crossover import calculate_ma_signal
from algorithms.rsi import calculate_rsi_signal
from algorithms.bollinger_band import calculate_bb_signal
from ai.sentiment import calculate_sentiment_signal

load_dotenv()

API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
BASE_URL = os.getenv("ALPACA_BASE_URL")

api = tradeapi.REST(API_KEY, SECRET_KEY, BASE_URL)

WATCHLIST = {
    "AAPL": "Apple", "MSFT": "Microsoft", "GOOGL": "Google", "AMZN": "Amazon",
    "NVDA": "Nvidia", "META": "Meta", "TSLA": "Tesla", "AMD": "AMD",
    "INTC": "Intel", "CRM": "Salesforce", "JPM": "JPMorgan", "BAC": "Bank of America",
    "GS": "Goldman Sachs", "MS": "Morgan Stanley", "WFC": "Wells Fargo",
    "BLK": "BlackRock", "AXP": "American Express", "V": "Visa", "MA": "Mastercard",
    "PYPL": "PayPal", "JNJ": "Johnson & Johnson", "UNH": "UnitedHealth",
    "PFE": "Pfizer", "ABBV": "AbbVie", "MRK": "Merck", "CVS": "CVS Health",
    "MDT": "Medtronic", "ABT": "Abbott", "BMY": "Bristol Myers", "AMGN": "Amgen",
    "XOM": "ExxonMobil", "CVX": "Chevron", "COP": "ConocoPhillips", "SLB": "SLB",
    "EOG": "EOG Resources", "PXD": "Pioneer Natural", "MPC": "Marathon Petroleum",
    "VLO": "Valero", "HAL": "Halliburton", "OXY": "Occidental", "WMT": "Walmart",
    "ETSY": "Etsy", "HD": "Home Depot", "NKE": "Nike", "SBUX": "Starbucks",
    "MCD": "McDonald's", "TGT": "Target", "COST": "Costco", "LOW": "Lowe's", "DG": "Dollar General"
}

ran_today = None

def is_after_market_close():
    try:
        clock = api.get_clock()
        return not clock.is_open
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

def calculate_confidence(ma_signal, rsi_signal, bb_signal, sentiment_signal):
    signals = [ma_signal, rsi_signal, bb_signal, sentiment_signal]
    buy_count = signals.count("BUY")
    sell_count = signals.count("SELL")

    if buy_count >= 3:
        return "BUY", buy_count
    elif sell_count >= 3:
        return "SELL", sell_count
    elif buy_count == 2:
        return "BUY", 2
    elif sell_count >= 2:
        return "SELL", 2
    else:
        return "NEUTRAL", 1

def generate_signals():
    session = SessionLocal()
    try:
        for ticker, company_name in WATCHLIST.items():
            ma_signal = calculate_ma_signal(ticker)
            rsi_signal = calculate_rsi_signal(ticker)
            bb_signal = calculate_bb_signal(ticker)
            sentiment_signal = calculate_sentiment_signal(ticker, company_name)

            overall_signal, confidence = calculate_confidence(ma_signal, rsi_signal, bb_signal, sentiment_signal)

            if confidence >= 2:
                signal = Signal(
                    ticker=ticker,
                    signal=overall_signal,
                    ma_signal=ma_signal,
                    rsi_signal=rsi_signal,
                    bb_signal=bb_signal,
                    sentiment_signal=sentiment_signal,
                    confidence=confidence,
                    sentiment_source=sentiment_signal,
                    price=0.0,
                    created_at=datetime.now()
                )
                session.add(signal)
                session.commit()
                print(f"Signal saved: {ticker} {overall_signal} confidence {confidence} sentiment {sentiment_signal}")
    except Exception as e:
        print(f"Error generating signals: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    print("Trading engine started...")
    while True:
        today = datetime.now().date()
        if is_after_market_close() and ran_today != today:
            print(f"Market just closed — fetching data for {today}...")
            fetch_and_store_prices()
            generate_signals()
            ran_today = today
            print("Done for today.")
        time.sleep(60)