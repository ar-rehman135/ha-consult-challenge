'use client';

import React, { useState, useEffect } from 'react';
import BacktestForm from '../components/BacktestForm';
import ResultsDisplay from '../components/ResultsDisplay';
import EquityChart from '../components/EquityChart';
import AuthForm from '../components/AuthForm';
import UserProfile from '../components/UserProfile';
import ApiService, { BacktestRequest, BacktestResponse } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [results, setResults] = useState<BacktestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      ApiService.setToken(token);
    }
  }, []);

  const handleAuthSuccess = (token: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    ApiService.setToken(token);
    router.push('/stock');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    ApiService.clearToken();
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

  // Show authentication form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Stock Strategy Backtester
            </h1>
            <p className="text-gray-600">
              Sign in to access the backtesting platform
            </p>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-4 py-2 rounded-md font-medium ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`px-4 py-2 rounded-md font-medium ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          <AuthForm onAuthSuccess={handleAuthSuccess} mode={authMode} />
        </div>
      </div>
    );
  }
}