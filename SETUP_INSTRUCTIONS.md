# Stock Strategy Backtester - Setup Instructions

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git

### Steps

1. **Clone and Setup**
```bash
git clone <repository-url>
cd Stock_Strategy_Analyzer
cp .env .env
```

2. **Start the Application**
```bash
docker-compose up --build
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Local Development Setup

### Backend Setup

1. **Create Python Virtual Environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup Database**
```bash
# Start PostgreSQL (using Docker)
docker run --name postgres-stock -e POSTGRES_PASSWORD=password -e POSTGRES_DB=stock_backtester -p 5432:5432 -d postgres:15

# Run database migrations
alembic upgrade head
```

4. **Start Backend Server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Access Frontend**
- Open http://localhost:3000

## Testing the Application

### 1. Basic Backtest

1. Open the frontend at http://localhost:3000
2. Fill in the strategy form:
   - **Ticker**: AAPL
   - **Start Date**: 2023-01-01
   - **End Date**: 2023-12-31
   - **SMA Period**: 10
   - **If Condition**: price > sma
   - **Then Action**: buy
   - **Else Action**: hold

3. Click "Run Backtest"
4. View results including:
   - Total return percentage
   - Win rate
   - Number of trades
   - Equity curve chart
   - Performance metrics

### 2. API Testing

Test the backend API directly:

```bash
# Health check
curl http://localhost:8000/health

# Get available tickers
curl http://localhost:8000/tickers

# Run a backtest
curl -X POST http://localhost:8000/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "sma_period": 10,
    "rule": {
      "if_condition": "price > sma",
      "then_action": "buy",
      "else_action": "hold"
    }
  }'
```

### 3. Different Strategies

Try these different strategies:

**Strategy 1: Buy on Price Above SMA**
- If: price > sma
- Then: buy
- Else: hold

**Strategy 2: Sell on Price Below SMA**
- If: price < sma
- Then: sell
- Else: hold

**Strategy 3: Volume-Based Strategy**
- If: volume > avg_volume
- Then: buy
- Else: hold

## Features to Test

### 1. Strategy Configuration
- ✅ Stock ticker input with suggestions
- ✅ Date range selection
- ✅ SMA period configuration
- ✅ Rule-based strategy builder
- ✅ Real-time strategy preview

### 2. Backtest Results
- ✅ Total return calculation
- ✅ Win rate analysis
- ✅ Number of trades
- ✅ Equity curve visualization
- ✅ Performance metrics (Sharpe ratio, drawdown, etc.)

### 3. Data Visualization
- ✅ Interactive equity curve chart
- ✅ Stock price overlay
- ✅ SMA indicator line
- ✅ Responsive design

### 4. API Features
- ✅ RESTful API endpoints
- ✅ Request validation
- ✅ Error handling
- ✅ Database persistence
- ✅ Analytics tracking

## Troubleshooting

### Common Issues

1. **Database Connection Error**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker restart postgres-stock
```

2. **Backend Import Errors**
```bash
# Ensure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt
```

3. **Frontend Build Errors**
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

4. **Port Already in Use**
```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Kill the process or change ports in docker-compose.yml
```

### Environment Variables

Make sure your `.env` file has the correct values:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/stock_backtester
CORS_ORIGINS=http://localhost:3000
POSTHOG_KEY=your_posthog_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here
```

## Performance Testing

### Load Testing

Test the API with multiple concurrent requests:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Ubuntu/Debian
brew install httpd  # macOS

# Test with 10 concurrent requests
ab -n 100 -c 10 -H "Content-Type: application/json" -p test_data.json http://localhost:8000/backtest
```

### Sample Test Data (test_data.json)
```json
{
  "ticker": "AAPL",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "sma_period": 10,
  "rule": {
    "if_condition": "price > sma",
    "then_action": "buy",
    "else_action": "hold"
  }
}
```

## Monitoring

### Logs
```bash
# View all container logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Database
```bash
# Connect to PostgreSQL
docker exec -it postgres-stock psql -U postgres -d stock_backtester

# View backtest runs
SELECT * FROM backtest_runs ORDER BY created_at DESC LIMIT 10;
```

## Next Steps

1. **Add Authentication**: Implement user registration and login
2. **Strategy Templates**: Pre-built strategy templates
3. **Advanced Indicators**: RSI, MACD, Bollinger Bands
4. **Portfolio Backtesting**: Test multiple stocks simultaneously
5. **Optimization**: Parameter optimization for strategies
6. **Real-time Data**: Live market data integration
7. **Alerts**: Strategy performance alerts
8. **Export**: Export results to PDF/Excel

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all services are running
3. Ensure environment variables are set correctly
4. Check network connectivity between services 