from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class RuleSchema(BaseModel):
    if_condition: str = Field(..., description="Condition to check (e.g., 'price > sma')")
    then_action: str = Field(..., description="Action to take if condition is true (e.g., 'buy')")
    else_action: str = Field(..., description="Action to take if condition is false (e.g., 'hold')")

class BacktestRequest(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol (e.g., 'AAPL')")
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    sma_period: int = Field(..., ge=1, le=200, description="Simple Moving Average period")
    rule: RuleSchema = Field(..., description="Trading rule configuration")

class BacktestResponse(BaseModel):
    total_return: float = Field(..., description="Total return percentage")
    win_rate: float = Field(..., description="Win rate as decimal (0-1)")
    num_trades: int = Field(..., description="Number of trades executed")
    equity_curve: List[Dict[str, Any]] = Field(..., description="Equity curve data points")
    summary: Dict[str, Any] = Field(..., description="Additional summary statistics")
    ticker: str = Field(..., description="Stock ticker symbol")
    start_date: str = Field(..., description="Start date")
    end_date: str = Field(..., description="End date")

# Authentication Schemas
class UserCreate(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    role: Optional[str] = Field(default="user", description="User role (user, premium, admin)")

class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user_id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    role: str = Field(..., description="User role")

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")

class BacktestRunResponse(BaseModel):
    id: int
    ticker: str
    start_date: datetime
    end_date: datetime
    sma_period: int
    rule_condition: str
    rule_then_action: str
    rule_else_action: str
    total_return: float
    win_rate: float
    num_trades: int
    created_at: datetime

    class Config:
        from_attributes = True 