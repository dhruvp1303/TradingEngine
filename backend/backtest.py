from models.database import SessionLocal, Price, BacktestResult
import pandas as pd
import numpy as np
from datetime import datetime

from algorithms.ma_crossover import calculate_ma_signal
from algorithms.rsi import calculate_rsi_signal
from algorithms.bollinger_band import calculate_bb_signal

WATCHLIST = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AMD", "INTC", "CRM",
    "JPM", "BAC", "GS", "MS", "WFC", "BLK", "AXP", "V", "MA", "PYPL",
    "JNJ", "UNH", "PFE", "ABBV", "MRK", "CVS", "MDT", "ABT", "BMY", "AMGN",
    "XOM", "CVX", "COP", "SLB", "EOG", "PXD", "MPC", "VLO", "HAL", "OXY",
    "WMT", "ETSY", "HD", "NKE", "SBUX", "MCD", "TGT", "COST", "LOW", "DG"
]

STARTING_CAPITAL = 100000
HIGH_CONFIDENCE_PCT = 0.10  # 10% for 3/3 signals
LOW_CONFIDENCE_PCT = 0.05   # 5% for 2/3 signals

def backtest(start_date, end_date, strategy="combined"):
    session = SessionLocal()
    positions = {}   # ticker -> {entry_price, shares, invested}
    trades = []
    cash = STARTING_CAPITAL
    portfolio_values = [STARTING_CAPITAL]

    try:
        days = session.query(Price.timestamp).filter(
            Price.timeframe == "1Day",
            Price.timestamp >= start_date,
            Price.timestamp <= end_date
        ).distinct().order_by(Price.timestamp).all()

        for (day,) in days:
            print(f"Processing {day.date()}...")
            
            for ticker in WATCHLIST:
                ma_signal = calculate_ma_signal(ticker, as_of_date=day)
                rsi_signal = calculate_rsi_signal(ticker, as_of_date=day)
                bb_signal = calculate_bb_signal(ticker, as_of_date=day)

                signals = [ma_signal, rsi_signal, bb_signal]
                buy_count = signals.count("BUY")
                sell_count = signals.count("SELL")

                if buy_count == 3:
                    final_signal = "BUY"
                    confidence = 3
                elif buy_count == 2:
                    final_signal = "BUY"
                    confidence = 2
                elif sell_count >= 2:
                    final_signal = "SELL"
                    confidence = sell_count
                else:
                    final_signal = "NEUTRAL"
                    confidence = 1

                price_row = session.query(Price).filter(
                    Price.ticker == ticker,
                    Price.timeframe == "1Day",
                    Price.timestamp == day
                ).first()

                if not price_row:
                    continue

                current_price = price_row.close

                # BUY logic
                if final_signal == "BUY" and ticker not in positions:
                    if confidence == 3:
                        invest_amount = STARTING_CAPITAL * HIGH_CONFIDENCE_PCT
                    else:
                        invest_amount = STARTING_CAPITAL * LOW_CONFIDENCE_PCT

                    if cash >= invest_amount:
                        shares = invest_amount / current_price
                        cash -= invest_amount
                        positions[ticker] = {
                            "entry_price": current_price,
                            "shares": shares,
                            "invested": invest_amount,
                            "confidence": confidence
                        }

                # SELL logic
                elif final_signal == "SELL" and ticker in positions:
                    entry_price = positions[ticker]["entry_price"]
                    shares = positions[ticker]["shares"]
                    invested = positions[ticker]["invested"]

                    exit_value = shares * current_price
                    profit_pct = (current_price - entry_price) / entry_price
                    profit_dollar = exit_value - invested

                    cash += exit_value

                    trades.append({
                        "ticker": ticker,
                        "entry": entry_price,
                        "exit": current_price,
                        "profit_pct": profit_pct,
                        "profit_dollar": profit_dollar,
                        "win": profit_pct > 0
                    })
                    del positions[ticker]

            # Calculate portfolio value at end of each day
            open_value = sum(
                pos["shares"] * session.query(Price).filter(
                    Price.ticker == ticker,
                    Price.timeframe == "1Day",
                    Price.timestamp == day
                ).first().close
                for ticker, pos in positions.items()
            )
            portfolio_values.append(cash + open_value)

        if len(trades) == 0:
            print("No trades generated")
            return

        df = pd.DataFrame(trades)
        
        # Core metrics
        win_rate = df["win"].mean()
        total_trades = len(trades)
        final_value = portfolio_values[-1]
        total_return = (final_value - STARTING_CAPITAL) / STARTING_CAPITAL
        annual_return = total_return / 2  # 2 year backtest

        # Sharpe ratio using daily portfolio returns
        portfolio_series = pd.Series(portfolio_values)
        daily_returns = portfolio_series.pct_change().dropna()
        sharpe_ratio = (daily_returns.mean() / daily_returns.std()) * np.sqrt(252)

        # Max drawdown
        portfolio_series_norm = portfolio_series / portfolio_series.cummax()
        max_drawdown = (portfolio_series_norm - 1).min()

        print(f"\n--- Backtest Results ---")
        print(f"Starting capital: ${STARTING_CAPITAL:,.2f}")
        print(f"Final portfolio value: ${final_value:,.2f}")
        print(f"Total profit: ${final_value - STARTING_CAPITAL:,.2f}")
        print(f"Total trades: {total_trades}")
        print(f"Win rate: {win_rate:.2%}")
        print(f"Annual return: {annual_return:.2%}")
        print(f"Sharpe ratio: {sharpe_ratio:.2f}")
        print(f"Max drawdown: {max_drawdown:.2%}")

        result = BacktestResult(
            strategy=strategy,
            win_rate=float(win_rate),
            total_trades=total_trades,
            annual_return=float(annual_return),
            sharpe_ratio=float(sharpe_ratio),
            max_drawdown=float(max_drawdown),
            timestamp=datetime.now()
        )
        session.add(result)
        session.commit()
        print("Backtest results saved!")

    except Exception as e:
        print(f"Backtest error: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    start = datetime(2024, 3, 11)
    end = datetime(2026, 3, 9)
    print("Running backtest...")
    backtest(start, end)