#!/usr/bin/env python3
"""
Database initialization script
Creates all tables including authentication tables and test users
"""
import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, text, Column, Integer, String, Float, DateTime, JSON, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from passlib.context import CryptContext

# Add the app directory to the path
sys.path.append(os.path.dirname(__file__))

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL",
                         "postgresql://stock_user:password123@postgres:5432/stock_backtester")

# Create base class for models (using the new import)
Base = declarative_base()


# Define models locally to avoid async import issues
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


def init_db():
    """Initialize the database by creating all tables and test users"""
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)

        # Drop existing tables if they exist (for clean setup)
        print("🗑️  Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)

        # Create all tables from SQLAlchemy models
        print("🏗️  Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")

        # Create test users
        create_test_users(engine)

    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        sys.exit(1)


def create_test_users(engine):
    """Create test users for authentication"""
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()

        # Password hashing
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        print("\n👥 Creating test users...")

        # Check if admin user exists
        result = session.execute(text("SELECT id FROM users WHERE email = 'admin@stocktester.com'"))
        admin_exists = result.fetchone() is not None

        if not admin_exists:
            print("Creating admin user...")
            hashed_password = pwd_context.hash("admin123456")
            session.execute(text("""
                INSERT INTO users (email, hashed_password, role, is_active, is_verified)
                VALUES ('admin@stocktester.com', :password, 'admin', TRUE, FALSE)
            """), {"password": hashed_password})
            print("✅ Admin user created successfully")
        else:
            print("ℹ️  Admin user already exists")

        # Check if premium user exists
        result = session.execute(text("SELECT id FROM users WHERE email = 'premium@stocktester.com'"))
        premium_exists = result.fetchone() is not None

        if not premium_exists:
            print("Creating premium test user...")
            hashed_password = pwd_context.hash("premium123456")
            session.execute(text("""
                INSERT INTO users (email, hashed_password, role, is_active, is_verified)
                VALUES ('premium@stocktester.com', :password, 'premium', TRUE, FALSE)
            """), {"password": hashed_password})
            print("✅ Premium user created successfully")
        else:
            print("ℹ️  Premium user already exists")

        # Check if regular user exists
        result = session.execute(text("SELECT id FROM users WHERE email = 'user@stocktester.com'"))
        regular_exists = result.fetchone() is not None

        if not regular_exists:
            print("Creating regular test user...")
            hashed_password = pwd_context.hash("user123456")
            session.execute(text("""
                INSERT INTO users (email, hashed_password, role, is_active, is_verified)
                VALUES ('user@stocktester.com', :password, 'user', TRUE, FALSE)
            """), {"password": hashed_password})
            print("✅ Regular user created successfully")
        else:
            print("ℹ️  Regular user already exists")

        session.commit()
        session.close()

        print("\n🎉 Test users created successfully!")
        print("\n📋 Test Users:")
        print("   Admin: admin@stocktester.com / admin123456")
        print("   Premium: premium@stocktester.com / premium123456")
        print("   Regular: user@stocktester.com / user123456")

    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        session.rollback()
        session.close()


if __name__ == "__main__":
    print("🚀 Initializing Database for Stock Strategy Backtester")
    print("=" * 60)
    init_db()
    print("\n🔧 Next Steps:")
    print("   1. Start the backend server: python -m uvicorn app.main:app --reload")
    print("   2. Start the frontend: npm run dev (from frontend directory)")
    print("   3. Access the application at http://localhost:3000")
    print("   4. Login with one of the test accounts above")
    print("\n🔐 Authentication Features:")
    print("   • JWT-based authentication")
    print("   • Role-based access control (user, premium, admin)")
    print("   • Password hashing with bcrypt")
    print("   • User management for admins")
    print("   • Premium features for premium users")