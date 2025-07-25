# Stock Strategy Backtester

A fullstack application for backtesting rule-based stock trading strategies using Next.js, FastAPI, PostgreSQL, and Backtrader.

## Features

- **Frontend**: Modern UI with Next.js and Chart.js for strategy input and results visualization
- **Backend**: FastAPI with Backtrader integration for strategy backtesting
- **Database**: PostgreSQL for storing backtest metadata and results
- **Real-time Data**: Yahoo Finance integration for OHLCV data
- **Analytics**: PostHog integration for user behavior tracking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   FastAPI       │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
│ - Strategy Form │    │ - Backtest API  │    │ - Backtest Runs │
│ - Results Chart │    │ - Data Service  │    │ - User Data     │
│ - Analytics     │    │ - Strategy Exec │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Chart.js, Tailwind CSS
- **Backend**: FastAPI, Python 3.11, Backtrader, yfinance
- **Database**: PostgreSQL, SQLAlchemy
- **Analytics**: PostHog
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd Stock_Strategy_Analyzer
```

2. Copy environment variables:
```bash
cp ..env .env
```

3. Start the application:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development

1. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```

3. **Database Setup**:
```bash
# Using Docker for PostgreSQL
docker run --name postgres-stock -e POSTGRES_PASSWORD=password -e POSTGRES_DB=stock_backtester -p 5432:5432 -d postgres:15
```

## API Endpoints

### POST /backtest
Run a backtest with the specified strategy parameters.

**Request Body**:
```json
{
  "ticker": "AAPL",
  "start_date": "2022-01-01",
  "end_date": "2022-12-31",
  "sma_period": 10,
  "rule": {
    "if": "price > sma",
    "then": "buy",
    "else": "hold"
  }
}
```

**Response**:
```json
{
  "total_return": 15.5,
  "win_rate": 0.65,
  "num_trades": 25,
  "equity_curve": [...],
  "summary": {...}
}
```

## Strategy Rules

The application supports simple rule-based strategies:

- **If Condition**: `price > sma`, `price < sma`, `volume > avg_volume`
- **Then Action**: `buy`, `sell`
- **Else Action**: `hold`, `exit`

## Project Structure

```
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── docker-compose.yml # Docker orchestration
└── README.md         # This file
```

## Development Guidelines

- Follow TypeScript best practices in frontend
- Use async/await patterns in backend
- Implement proper error handling
- Add comprehensive logging
- Write unit tests for critical components

## Deployment

The application is containerized and ready for deployment to:
- AWS EC2
- Google Cloud Run
- Azure Container Instances
- Any Docker-compatible platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 