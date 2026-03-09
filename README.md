TradingEngine
A real-time algorithmic trading signal engine that ingests live market data for 50 stocks, runs 3 trading strategies simultaneously, and stores buy/sell signals with confidence scores.
What It Does

Fetches live stock prices from Alpaca Markets API every 5 minutes
Runs 3 algorithms: Moving Average Crossover, RSI, and Bollinger Bands
Scores signal confidence 1-3 based on strategy agreement
Stores all prices, signals, and backtest results in PostgreSQL
FastAPI backend serving live signals to a React dashboard

Tech Stack
Python · FastAPI · PostgreSQL · SQLAlchemy · Alpaca Markets API · React · AWS EC2 · Vercel
Status
🚧 In active development — backend data pipeline complete, algorithms in progress
Live Demo
Coming soon
