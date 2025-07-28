'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import ApiService, { BacktestRequest } from '../lib/api';

interface BacktestFormProps {
  onSubmit: (request: BacktestRequest) => void;
  isLoading: boolean;
}

const BacktestForm: React.FC<BacktestFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<BacktestRequest>({
    ticker: 'AAPL',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    sma_period: 10,
    rule: {
      if_condition: 'price > sma',
      then_action: 'buy',
      else_action: 'hold'
    }
  });

  const [availableTickers, setAvailableTickers] = useState<string[]>([]);
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);

  useEffect(() => {
    // Load available tickers
    ApiService.getAvailableTickers().then(setAvailableTickers);
  }, []);
console.log({availableTickers});

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BacktestRequest] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'];

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-6 h-6 text-primary-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Strategy Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stock Ticker */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Ticker
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
              className="input-field pr-10 text-black"
              placeholder="e.g., AAPL"
              required
            />
            <button
              type="button"
              onClick={() => setShowTickerDropdown(!showTickerDropdown)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {showTickerDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Popular Stocks</div>
                <div className="grid grid-cols-2 gap-1">
                  {popularTickers.map((ticker) => (
                    <button
                      key={ticker}
                      type="button"
                      onClick={() => {
                        handleInputChange('ticker', ticker);
                        setShowTickerDropdown(false);
                      }}
                      className="text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-black"
                    >
                      {ticker}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="input-field text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className="input-field text-black"
              required
            />
          </div>
        </div>

        {/* SMA Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            SMA Period
          </label>
          <input
            type="number"
            value={formData.sma_period}
            onChange={(e) => handleInputChange('sma_period', parseInt(e.target.value))}
            className="input-field text-black"
            min="1"
            max="200"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Simple Moving Average period (1-200 days)
          </p>
        </div>

        {/* Trading Rule */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Trading Rule</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              If Condition
            </label>
            <select
              value={formData.rule.if_condition}
              onChange={(e) => handleInputChange('rule.if_condition', e.target.value)}
              className="input-field text-black"
              required
            >
              <option value="price > sma" className='text-black'>Price &gt; SMA</option>
              <option value="price < sma" className='text-black'>Price &lt; SMA</option>
              <option value="price >= sma" className='text-black'>Price &gt;= SMA</option>
              <option value="price <= sma" className='text-black'>Price &lt;= SMA</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Then Action
              </label>
              <select
                value={formData.rule.then_action}
                onChange={(e) => handleInputChange('rule.then_action', e.target.value)}
                className="input-field text-black"
                required
              >
                <option value="buy" className='text-black'>Buy</option>
                <option value="sell" className='text-black'>Sell</option>
                <option value="hold" className='text-black'>Hold</option>
                <option value="exit" className='text-black'>Exit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Else Action
              </label>
              <select
                value={formData.rule.else_action}
                onChange={(e) => handleInputChange('rule.else_action', e.target.value)}
                className="input-field text-black"
                required
              >
                <option value="hold" className='text-black'>Hold</option>
                <option value="buy" className='text-black'>Buy</option>
                <option value="sell" className='text-black'>Sell</option>
                <option value="exit" className='text-black'>Exit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Backtest...
              </div>
            ) : (
              'Run Backtest'
            )}
          </button>
        </div>
      </form>

      {/* Strategy Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Strategy Preview</h4>
        <p className="text-sm text-gray-600">
          If <span className="font-medium">{formData.rule.if_condition}</span>, then{' '}
          <span className="font-medium">{formData.rule.then_action}</span>, else{' '}
          <span className="font-medium">{formData.rule.else_action}</span>
        </p>
      </div>
    </div>
  );
};

export default BacktestForm; 