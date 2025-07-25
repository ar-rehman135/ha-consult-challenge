'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { BacktestResponse } from '../lib/api';

interface ResultsDisplayProps {
  results: BacktestResponse | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) {
    return null;
  }

  const formatPercentage = (value: number) => {
    const color = value >= 0 ? 'text-success-600' : 'text-danger-600';
    const icon = value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    return (
      <span className={`flex items-center ${color}`}>
        {icon}
        <span className="ml-1">{value >= 0 ? '+' : ''}{typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : 0}%</span>
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
      if(!value) return '0'
    return new Intl.NumberFormat('en-US').format(value);
  };
const safeFormat = (obj: any, path: string, decimals:number = 2) => {
  const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
  return typeof value === 'number' && !isNaN(value)
    ? value.toFixed(decimals)
    : "N/A";
}
  return (
    <div className="space-y-6">
      {/* Main Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Return</p>
              <p className="text-2xl font-bold">
                {formatPercentage(results.total_return)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-success-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-success-600">
                {safeFormat(results, "summary.win_rate")}%
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Trades</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(results.num_trades)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="card">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Sharpe Ratio</p>
            <p className="text-lg font-semibold text-gray-900">
              {safeFormat(results, "summary.sharpe_ratio")}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Max Drawdown</p>
            <p className="text-lg font-semibold text-danger-600">
              {formatPercentage(results.summary.max_drawdown)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Annual Return</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage(results.summary.annual_return)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Volatility</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage(results.summary.volatility)}
            </p>
          </div>
        </div>
      </div>

      {/* Trade Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Trade Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Winning Trades</p>
            <p className="text-lg font-semibold text-success-600">
              {formatNumber(results.summary.winning_trades)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Losing Trades</p>
            <p className="text-lg font-semibold text-danger-600">
              {formatNumber(results.summary.losing_trades)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Avg Trade Duration</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.floor(results.summary.avg_trade_duration)} days
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Max Consecutive Wins</p>
            <p className="text-lg font-semibold text-success-600">
              {results.summary.max_consecutive_wins}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">Max Consecutive Losses</p>
          <p className="text-lg font-semibold text-danger-600">
            {results.summary.max_consecutive_losses}
          </p>
        </div>
      </div>

      {/* Strategy Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Summary</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Ticker:</p>
              <p className="text-gray-900">{results.ticker}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Period:</p>
              <p className="text-gray-900">
                {new Date(results.start_date).toLocaleDateString()} - {new Date(results.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 