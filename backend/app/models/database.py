from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL",
                         "postgresql://stock_user:password123@postgres:5432/stock_backtester")

# Create sync engine (not async to avoid asyncpg dependency)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # user, premium, admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with backtest runs
    backtest_runs = relationship("BacktestRun", back_populates="user")


class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticker = Column(String, index=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    sma_period = Column(Integer)
    rule_condition = Column(String)
    rule_then_action = Column(String)
    rule_else_action = Column(String)
    total_return = Column(Float)
    win_rate = Column(Float)
    num_trades = Column(Integer)
    equity_curve = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship with user
    user = relationship("User", back_populates="backtest_runs")


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()