import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True)
    ticker = Column(String)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Float)
    timestamp = Column(DateTime)

class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True)
    ticker = Column(String)
    signal = Column(String)
    ma_signal = Column(String)
    rsi_signal = Column(String)
    bb_signal = Column(String)
    confidence = Column(Integer)
    sentiment_score = Column(Float, nullable=True)
    sentiment_source = Column(String, nullable=True)
    price = Column(Float)
    created_at = Column(DateTime)

class BacktestResult(Base):
    __tablename__ = "backtest_results"

    id = Column(Integer, primary_key=True)
    strategy = Column(String)
    win_rate = Column(Float)
    total_trades = Column(Integer)
    annual_return = Column(Float)
    sharpe_ratio = Column(Float)
    max_drawdown = Column(Float)
    timestamp = Column(DateTime)

Base.metadata.create_all(engine)