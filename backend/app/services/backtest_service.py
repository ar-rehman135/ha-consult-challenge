import backtrader as bt
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional
import logging
from ..strategies.sma_strategy import RuleBasedStrategy
from .data_service import DataService

logger = logging.getLogger(__name__)


class BacktestService:
    """Service for running backtests using Backtrader"""

    def __init__(self):
        self.data_service = DataService()

    async def run_backtest(
            self,
            ticker: str,
            start_date: str,
            end_date: str,
            sma_period: int,
            rule_condition: str,
            then_action: str,
            else_action: str
    ) -> Optional[Dict[str, Any]]:
        """
        Run a complete backtest with the specified parameters

        Args:
            ticker: Stock ticker symbol
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            sma_period: Simple Moving Average period
            rule_condition: Trading condition (e.g., 'price > sma')
            then_action: Action when condition is true
            else_action: Action when condition is false

        Returns:
            Dictionary with backtest results or None if error
        """
        try:
            logger.info(f"Starting backtest for {ticker}")
            # Fetch stock data
            data = await self.data_service.get_stock_data(ticker, start_date, end_date)
            if data is None:
                logger.error(f"Failed to fetch data for {ticker}")
                return None

            # Create Backtrader cerebro engine
            cerebro = bt.Cerebro()

            # Add data feed
            data_feed = self._create_data_feed(data)
            cerebro.adddata(data_feed)

            # Set initial cash
            cerebro.broker.setcash(100000.0)

            # Set commission
            cerebro.broker.setcommission(commission=0.001)  # 0.1%

            # Add strategy
            cerebro.addstrategy(
                RuleBasedStrategy,
                sma_period=sma_period,
                rule_condition=rule_condition,
                then_action=then_action,
                else_action=else_action
            )

            # Add analyzers
            cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')
            cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
            cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
            cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')

            # Run the backtest
            logger.info("Running backtest...")
            results = cerebro.run()

            if not results:
                logger.error("Backtest failed to produce results")
                return None

            # Extract strategy results
            strategy = results[0]
            results_dict = strategy.get_results()

            # Add analyzer results
            analyzers = results[0].analyzers
            results_dict.update(self._extract_analyzer_results(analyzers))

            # Add metadata
            results_dict.update({
                'ticker': ticker,
                'start_date': start_date,
                'end_date': end_date,
                'sma_period': sma_period,
                'rule_condition': rule_condition,
                'then_action': then_action,
                'else_action': else_action,
                'initial_cash': cerebro.broker.startingcash,
                'final_cash': cerebro.broker.getvalue()
            })

            logger.info(f"Backtest completed successfully for {ticker}")
            logger.info(f"Total Return: {results_dict['total_return']:.2f}%")
            logger.info(f"Win Rate: {results_dict['win_rate']:.2%}")
            logger.info(f"Number of Trades: {results_dict['num_trades']}")

            return results_dict

        except Exception as e:
            logger.error(f"Error running backtest: {str(e)}")
            return None

    def _create_data_feed(self, data: pd.DataFrame) -> bt.feeds.PandasData:
        """Create a Backtrader data feed from pandas DataFrame"""
        # Ensure data has the correct format
        data_feed = bt.feeds.PandasData(
            dataname=data,
            datetime=None,  # Use index as datetime
            open='Open',
            high='High',
            low='Low',
            close='Close',
            volume='Volume',
            openinterest=-1  # Not used
        )
        return data_feed

    def _extract_analyzer_results(self, analyzers) -> Dict[str, Any]:
        """Extract results from Backtrader analyzers"""
        results = {}

        # Trade analyzer results
        if hasattr(analyzers, 'trades'):
            trades = analyzers.trades
            if trades:
                # Get the analysis dictionary
                trades_analysis = trades.get_analysis()

                # Extract trade statistics safely
                results.update({
                    'total_trades': trades_analysis.get('total', {}).get('total', 0),
                    'winning_trades': trades_analysis.get('won', {}).get('total', 0),
                    'losing_trades': trades_analysis.get('lost', {}).get('total', 0),
                    'avg_trade_duration': trades_analysis.get('len', {}).get('average', 0),
                    'max_consecutive_wins': trades_analysis.get('streak', {}).get('won', {}).get('longest', 0),
                    'max_consecutive_losses': trades_analysis.get('streak', {}).get('lost', {}).get('longest', 0),
                })

        # Sharpe ratio
        if hasattr(analyzers, 'sharpe'):
            sharpe = analyzers.sharpe
            results['sharpe_ratio'] = sharpe.get_analysis().get('sharperatio', 0)

        # Drawdown
        if hasattr(analyzers, 'drawdown'):
            drawdown = analyzers.drawdown
            results.update({
                'max_drawdown': drawdown.get_analysis().get('max', {}).get('drawdown', 0),
                'max_drawdown_length': drawdown.get_analysis().get('max', {}).get('len', 0),
            })

        # Returns
        if hasattr(analyzers, 'returns'):
            returns = analyzers.returns
            results.update({
                'annual_return': returns.get_analysis().get('rnorm100', 0),
                'volatility': returns.get_analysis().get('std', 0),
            })

        return results

    def validate_parameters(
            self,
            ticker: str,
            start_date: str,
            end_date: str,
            sma_period: int,
            rule_condition: str,
            then_action: str,
            else_action: str
    ) -> Dict[str, Any]:
        """Validate backtest parameters"""
        errors = []

        # Validate ticker
        if not ticker or len(ticker.strip()) == 0:
            errors.append("Ticker symbol is required")

        # Validate dates
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")

            if start_dt >= end_dt:
                errors.append("Start date must be before end date")

            if start_dt > datetime.now():
                errors.append("Start date cannot be in the future")

        except ValueError:
            errors.append("Invalid date format. Use YYYY-MM-DD")

        # Validate SMA period
        if sma_period < 1 or sma_period > 200:
            errors.append("SMA period must be between 1 and 200")

        # Validate rule condition
        valid_conditions = [
            'price > sma', 'price < sma', 'price >= sma', 'price <= sma',
            'volume > avg_volume', 'volume < avg_volume'
        ]
        if rule_condition.lower() not in valid_conditions:
            errors.append(f"Invalid rule condition. Must be one of: {', '.join(valid_conditions)}")

        # Validate actions
        valid_actions = ['buy', 'sell', 'hold', 'exit']
        if then_action.lower() not in valid_actions:
            errors.append(f"Invalid 'then' action. Must be one of: {', '.join(valid_actions)}")

        if else_action.lower() not in valid_actions:
            errors.append(f"Invalid 'else' action. Must be one of: {', '.join(valid_actions)}")

        return {
            'valid': len(errors) == 0,
            'errors': errors
        }