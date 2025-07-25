
'use client';

import BacktestForm from '@/components/BacktestForm';
import EquityChart from '@/components/EquityChart';
import ResultsDisplay from '@/components/ResultsDisplay';
import UserProfile from '@/components/UserProfile';
import React, { useState, useEffect } from 'react';

import ApiService, { BacktestRequest, BacktestResponse } from '../../lib/api';
import { useRouter } from 'next/navigation';


export default function StockPage() {
    const [results, setResults] = useState<BacktestResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter()



    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
    
        if (token && userData) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
          // Set the token in API service
          ApiService.setToken(token);
        } else {
            router.push('/');
        }
      }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        ApiService.clearToken();
        router.push('/');
      };
    
      const handleBacktestSubmit = async (request: BacktestRequest) => {
        setIsLoading(true);
        setError(null);
        setResults(null);
    
        try {
          const response = await ApiService.runBacktest(request);
          setResults(response);
    
          // Track analytics event
          if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('backtest_run', {
              ticker: request.ticker,
              total_return: response.total_return,
              num_trades: response.num_trades,
            });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
          setIsLoading(false);
        }
      };

    return (
        <div className="space-y-8">
          {/* Header with User Profile */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Stock Strategy Backtester
              </h1>
              <p className="text-xl text-gray-600">
                Welcome back, {user?.email}!
              </p>
            </div>
            <UserProfile user={user} onLogout={handleLogout} />
    
          </div>
    
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Strategy Form */}
            <div>
              <BacktestForm onSubmit={handleBacktestSubmit} isLoading={isLoading} />
            </div>
    
            {/* Results */}
            <div className="space-y-6">
              {error && (
                <div className="card bg-danger-50 border-danger-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-danger-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-danger-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
    
              {isLoading && (
                <div className="card">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Running backtest...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </div>
                  </div>
                </div>
              )}
    
              {results && (
                <>
                  <ResultsDisplay results={results} />
                  <EquityChart equityCurve={results.equity_curve} ticker={results.ticker} />
                </>
              )}
            </div>
          </div>
    
          {/* Features Section */}
          <div className="mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Historical Analysis</h3>
                <p className="text-gray-600">
                  Test your strategies against real historical market data to validate their effectiveness.
                </p>
              </div>
    
              <div className="text-center">
                <div className="bg-success-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                <p className="text-gray-600">
                  Get comprehensive performance metrics including Sharpe ratio, drawdown, and win rate.
                </p>
              </div>
    
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rule-Based Strategies</h3>
                <p className="text-gray-600">
                  Create and test simple rule-based trading strategies with easy-to-understand conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
}