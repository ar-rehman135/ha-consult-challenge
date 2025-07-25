import backtrader as bt
import pandas as pd
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class RuleBasedStrategy(bt.Strategy):
    """
    A rule-based trading strategy using Backtrader
    
    This strategy implements simple conditional rules like:
    - If price > SMA, then buy, else hold
    - If price < SMA, then sell, else hold
    - If volume > avg_volume, then buy, else hold
    """
    
    params = (
        ('sma_period', 10),
        ('rule_condition', 'price > sma'),
        ('then_action', 'buy'),
        ('else_action', 'hold'),
    )
    
    def __init__(self):
        """Initialize the strategy with indicators"""
        # Store the data feed
        self.dataclose = self.datas[0].close
        self.datahigh = self.datas[0].high
        self.datalow = self.datas[0].low
        self.dataopen = self.datas[0].open
        self.datavolume = self.datas[0].volume
        
        # Calculate indicators
        self.sma = bt.indicators.SimpleMovingAverage(
            self.dataclose, period=self.params.sma_period
        )
        
        # Volume SMA for volume-based rules
        self.volume_sma = bt.indicators.SimpleMovingAverage(
            self.datavolume, period=self.params.sma_period
        )
        
        # Track orders and positions
        self.order = None
        self.buyprice = None
        self.buycomm = None
        
        # Track equity curve
        self.equity_curve = []
        self.trade_history = []
        
        logger.info(f"Strategy initialized with SMA period: {self.params.sma_period}")
        logger.info(f"Rule: {self.params.rule_condition}")
        logger.info(f"Then action: {self.params.then_action}")
        logger.info(f"Else action: {self.params.else_action}")
    
    def log(self, txt, dt=None):
        """Logging function"""
        dt = dt or self.datas[0].datetime.date(0)
        logger.info(f'{dt.isoformat()}: {txt}')
    
    def notify_order(self, order):
        """Handle order notifications"""
        if order.status in [order.Submitted, order.Accepted]:
            return
        
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(f'BUY EXECUTED, Price: {order.executed.price:.2f}, '
                        f'Cost: {order.executed.value:.2f}, '
                        f'Comm: {order.executed.comm:.2f}')
                self.buyprice = order.executed.price
                self.buycomm = order.executed.comm
            else:
                self.log(f'SELL EXECUTED, Price: {order.executed.price:.2f}, '
                        f'Cost: {order.executed.value:.2f}, '
                        f'Comm: {order.executed.comm:.2f}')
            
            # Record trade
            self.trade_history.append({
                'date': self.datas[0].datetime.date(0).isoformat(),
                'type': 'BUY' if order.isbuy() else 'SELL',
                'price': order.executed.price,
                'size': order.executed.size,
                'value': order.executed.value,
                'commission': order.executed.comm
            })
        
        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log('Order Canceled/Margin/Rejected')
        
        self.order = None
    
    def notify_trade(self, trade):
        """Handle trade notifications"""
        if not trade.isclosed:
            return
        
        self.log(f'OPERATION PROFIT, GROSS: {trade.pnl:.2f}, NET: {trade.pnlcomm:.2f}')
    
    def evaluate_condition(self) -> bool:
        """Evaluate the trading condition"""
        condition = self.params.rule_condition.lower()
        
        if condition == 'price > sma':
            return self.dataclose[0] > self.sma[0]
        elif condition == 'price < sma':
            return self.dataclose[0] < self.sma[0]
        elif condition == 'price >= sma':
            return self.dataclose[0] >= self.sma[0]
        elif condition == 'price <= sma':
            return self.dataclose[0] <= self.sma[0]
        elif condition == 'volume > avg_volume':
            return self.datavolume[0] > self.volume_sma[0]
        elif condition == 'volume < avg_volume':
            return self.datavolume[0] < self.volume_sma[0]
        else:
            # Default to false for unknown conditions
            logger.warning(f"Unknown condition: {condition}")
            return False
    
    def execute_action(self, action: str):
        """Execute the specified action"""
        action = action.lower()
        
        if action == 'buy' and not self.position:
            self.log(f'BUY CREATE, {self.dataclose[0]:.2f}')
            self.order = self.buy()
        elif action == 'sell' and self.position:
            self.log(f'SELL CREATE, {self.dataclose[0]:.2f}')
            self.order = self.sell()
        elif action == 'hold':
            # Do nothing
            pass
        elif action == 'exit' and self.position:
            self.log(f'EXIT CREATE, {self.dataclose[0]:.2f}')
            self.order = self.close()
        else:
            logger.warning(f"Invalid action or position state: {action}")
    
    def next(self):
        """Main strategy logic executed for each bar"""
        # Record equity curve
        self.equity_curve.append({
            'date': self.datas[0].datetime.date(0).isoformat(),
            'equity': self.broker.getvalue(),
            'cash': self.broker.getcash(),
            'position_value': self.broker.getvalue() - self.broker.getcash(),
            'close_price': self.dataclose[0],
            'sma': self.sma[0] if not pd.isna(self.sma[0]) else None
        })
        
        # Check if we have a pending order
        if self.order:
            return
        
        # Evaluate the condition
        condition_met = self.evaluate_condition()
        
        # Execute appropriate action
        if condition_met:
            self.execute_action(self.params.then_action)
        else:
            self.execute_action(self.params.else_action)
    
    def stop(self):
        """Called when the strategy stops"""
        self.log(f'Final Portfolio Value: {self.broker.getvalue():.2f}')
        self.log(f'Total Return: {((self.broker.getvalue() / self.broker.startingcash) - 1) * 100:.2f}%')
        
        # Calculate win rate
        if hasattr(self, 'analyzers') and 'trades' in self.analyzers:
            trades_analyzer = self.analyzers.trades
            if trades_analyzer.trades:
                winning_trades = sum(1 for trade in trades_analyzer.trades if trade.pnl > 0)
                total_trades = len(trades_analyzer.trades)
                win_rate = winning_trades / total_trades if total_trades > 0 else 0
                self.log(f'Win Rate: {win_rate:.2%} ({winning_trades}/{total_trades})')
    
    def get_results(self) -> Dict[str, Any]:
        """Get strategy results"""
        total_return = ((self.broker.getvalue() / self.broker.startingcash) - 1) * 100
        
        # Calculate win rate from trade history
        winning_trades = sum(1 for trade in self.trade_history if trade.get('pnl', 0) > 0)
        total_trades = len(self.trade_history)
        win_rate = winning_trades / total_trades if total_trades > 0 else 0
        
        return {
            'total_return': total_return,
            'win_rate': win_rate,
            'num_trades': total_trades,
            'equity_curve': self.equity_curve,
            'trade_history': self.trade_history,
            'final_value': self.broker.getvalue(),
            'starting_value': self.broker.startingcash
        } 