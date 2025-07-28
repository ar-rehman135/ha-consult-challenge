import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export interface BacktestRequest {
  ticker: string;
  start_date: string;
  end_date: string;
  sma_period: number;
  rule: {
    if_condition: string;
    then_action: string;
    else_action: string;
  };
}

export interface BacktestResponse {
  total_return: number;
  win_rate: number;
  num_trades: number;
  equity_curve: Array<{
    date: string;
    equity: number;
    cash: number;
    position_value: number;
    close_price: number;
    sma?: number;
  }>;
  summary: {
    sharpe_ratio: number;
    max_drawdown: number;
    annual_return: number;
    volatility: number;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    avg_trade_duration: number;
    max_consecutive_wins: number;
    max_consecutive_losses: number;
  };
  ticker: string;
  start_date: string;
  end_date: string;
}

export interface BacktestRun {
  id: number;
  ticker: string;
  start_date: string;
  end_date: string;
  sma_period: number;
  rule_condition: string;
  rule_then_action: string;
  rule_else_action: string;
  total_return: number;
  win_rate: number;
  num_trades: number;
  created_at: string;
}

export class ApiService {
  static setToken(token: string) {
    localStorage.setItem('token', token);
  }

  static clearToken() {
    localStorage.removeItem('token');
  }

  static async runBacktest(request: BacktestRequest): Promise<BacktestResponse> {
    try {
      const response = await api.post('/api/backtest', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
          throw new Error(error.response.data.detail);
        }
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async getAvailableTickers(): Promise<string[]> {
    try {
      const response = await api.get('/api/tickers');
      return response.data;
    } catch (error) {
      console.error('Error fetching tickers:', error);
      return [];
    }
  }

  static async getBacktestRuns(skip: number = 0, limit: number = 10): Promise<BacktestRun[]> {
    try {
      const response = await api.get(`/api/backtest-runs?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backtest runs:', error);
      return [];
    }
  }

  static async getBacktestRun(id: number): Promise<BacktestRun> {
    try {
      const response = await api.get(`/api/backtest-runs/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Backtest run not found');
        }
      }
      throw new Error('Failed to fetch backtest run');
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/api/health');
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export default ApiService;