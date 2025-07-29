from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from typing import List

from ..models.database import get_db, BacktestRun, User
from ..models.schemas import BacktestRequest, BacktestResponse, BacktestRunResponse
from ..services.backtest_service import BacktestService
from ..services.data_service import DataService
from ..services.auth_service import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["backtest"])

# Initialize services
backtest_service = BacktestService()
data_service = DataService()

@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(
    request: BacktestRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run a backtest with the specified strategy parameters
    
    This endpoint accepts a backtest request and returns the results including:
    - Total return percentage
    - Win rate
    - Number of trades
    - Equity curve data
    - Additional summary statistics
    """
    try:
        logger.info(f"Received backtest request for {request.ticker}")
        
        # Validate parameters
        validation = backtest_service.validate_parameters(
            request.ticker,
            request.start_date,
            request.end_date,
            request.sma_period,
            request.rule.if_condition,
            request.rule.then_action,
            request.rule.else_action
        )
        
        if not validation['valid']:
            raise HTTPException(
                status_code=400,
                detail={"message": "Invalid parameters", "errors": validation['errors']}
            )
        
        # Run the backtest
        results = await backtest_service.run_backtest(
            request.ticker,
            request.start_date,
            request.end_date,
            request.sma_period,
            request.rule.if_condition,
            request.rule.then_action,
            request.rule.else_action
        )
        
        if results is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to run backtest. Please check your parameters and try again."
            )
        
        # Save to database in background
        background_tasks.add_task(
            save_backtest_run,
            db,
            request,
            results,
            current_user.id
        )
        
        # Track analytics event
        background_tasks.add_task(
            track_backtest_event,
            request.ticker,
            results['total_return']
        )
        
        # Prepare response
        response = BacktestResponse(
            total_return=results['total_return'],
            win_rate=results['win_rate'],
            num_trades=results['num_trades'],
            equity_curve=results['equity_curve'],
            summary={
                'sharpe_ratio': results.get('sharpe_ratio', 0),
                'max_drawdown': results.get('max_drawdown', 0),
                'annual_return': results.get('annual_return', 0),
                'volatility': results.get('volatility', 0),
                'total_trades': results.get('total_trades', 0),
                'winning_trades': results.get('winning_trades', 0),
                'losing_trades': results.get('losing_trades', 0),
                'avg_trade_duration': results.get('avg_trade_duration', 0),
                'max_consecutive_wins': results.get('max_consecutive_wins', 0),
                'max_consecutive_losses': results.get('max_consecutive_losses', 0),
            },
            ticker=request.ticker,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        logger.info(f"Backtest completed successfully for {request.ticker}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in backtest endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again later."
        )

@router.get("/tickers", response_model=List[str])
async def get_available_tickers():
    """Get a list of popular stock tickers for suggestions"""
    return data_service.get_available_tickers()

@router.get("/backtest-runs", response_model=List[BacktestRunResponse])
async def get_backtest_runs(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent backtest runs"""
    try:
        # Filter runs by user (regular users can only see their own runs)
        if current_user.role == "admin":
            runs = db.query(BacktestRun).order_by(BacktestRun.created_at.desc()).offset(skip).limit(limit).all()
        else:
            runs = db.query(BacktestRun).filter(BacktestRun.user_id == current_user.id).order_by(BacktestRun.created_at.desc()).offset(skip).limit(limit).all()
        return runs
    except Exception as e:
        logger.error(f"Error fetching backtest runs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch backtest runs")

@router.get("/backtest-runs/{run_id}", response_model=BacktestRunResponse)
async def get_backtest_run(
    run_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific backtest run by ID"""
    try:
        run = db.query(BacktestRun).filter(BacktestRun.id == run_id).first()
        if not run:
            raise HTTPException(status_code=404, detail="Backtest run not found")
        
        # Check if user has access to this run
        if current_user.role != "admin" and run.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return run
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching backtest run {run_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch backtest run")

def save_backtest_run(db: Session, request: BacktestRequest, results: dict, user_id: int):
    """Save backtest run to database"""
    try:
        backtest_run = BacktestRun(
            user_id=user_id,
            ticker=request.ticker,
            start_date=datetime.strptime(request.start_date, "%Y-%m-%d"),
            end_date=datetime.strptime(request.end_date, "%Y-%m-%d"),
            sma_period=request.sma_period,
            rule_condition=request.rule.if_condition,
            rule_then_action=request.rule.then_action,
            rule_else_action=request.rule.else_action,
            total_return=results['total_return'],
            win_rate=results['win_rate'],
            num_trades=results['num_trades'],
            equity_curve=results['equity_curve']
        )
        
        db.add(backtest_run)
        db.commit()
        logger.info(f"Saved backtest run {backtest_run.id} to database")
        
    except Exception as e:
        logger.error(f"Error saving backtest run to database: {str(e)}")
        db.rollback()

def track_backtest_event(ticker: str, total_return: float):
    """Track backtest event for analytics"""
    try:
        # Import PostHog here to avoid circular imports
        from posthog import PostHog
        import os
        
        posthog_key = os.getenv("POSTHOG_KEY")
        if posthog_key:
            posthog = PostHog(posthog_key)
            posthog.capture(
                'backtest_run',
                {
                    'ticker': ticker,
                    'total_return': total_return,
                    'timestamp': datetime.utcnow().isoformat()
                }
            )
            logger.info(f"Tracked backtest event for {ticker}")
    except Exception as e:
        logger.error(f"Error tracking analytics event: {str(e)}") 