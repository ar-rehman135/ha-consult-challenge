# Stock Strategy Backtester

A production-ready, fullstack application for backtesting rule-based stock trading strategies with enterprise-grade authentication, analytics, and real-time data processing.

## 🚀 Overview

This application provides a comprehensive platform for developing, testing, and analyzing stock trading strategies using modern web technologies and professional-grade architecture patterns.

### ✨ Key Features

- **🔐 Enterprise Authentication**: JWT-based auth with role-based access control (User/Premium/Admin)
- **📈 Strategy Backtesting**: Rule-based strategy testing with Backtrader integration
- **📊 Interactive Analytics**: Real-time chart visualization with Chart.js
- **🎯 User Analytics**: PostHog integration for behavior tracking
- **⚡ Real-time Data**: Yahoo Finance integration for OHLCV data
- **🐳 Containerized Deployment**: Docker-ready with production configuration
- **🔄 CI/CD Ready**: Structured for modern deployment pipelines

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 14 + TypeScript]
        B[Chart.js Visualization]
        C[Tailwind CSS]
    end
    
    subgraph "API Gateway"
        D[Nginx Reverse Proxy]
    end
    
    subgraph "Backend Layer"
        E[FastAPI + Python 3.11]
        F[JWT Authentication]
        G[Backtrader Engine]
    end
    
    subgraph "Data Layer"
        H[PostgreSQL 15]
        I[Yahoo Finance API]
    end
    
    subgraph "Analytics"
        J[PostHog Analytics]
    end
    
    A --> D
    D --> E
    E --> H
    E --> I
    E --> J
    B --> A
    C --> A
    F --> E
    G --> E
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Language**: Python 3.11
- **Database**: PostgreSQL 15 with SQLAlchemy 2.0
- **Authentication**: JWT with bcrypt password hashing
- **Trading Engine**: Backtrader 1.9.78
- **Data Source**: Yahoo Finance (yfinance)
- **Analytics**: PostHog 3.1.0
- **Server**: Uvicorn with auto-reload

### Frontend
- **Framework**: Next.js 14.0.4 with TypeScript 5.3
- **Styling**: Tailwind CSS 3.3.6
- **Charts**: Chart.js 4.4.0 + React Chart.js 2
- **HTTP Client**: Axios 1.6.2
- **Icons**: Lucide React 0.294
- **Analytics**: PostHog JS 1.96.1

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx Alpine
- **Database**: PostgreSQL 15 with persistent volumes
- **Environment**: Multi-stage Docker builds

## 📁 Project Structure

```
stock-strategy-backtester/
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── models/             # Database models & schemas
│   │   │   ├── database.py     # SQLAlchemy models
│   │   │   └── schemas.py      # Pydantic schemas
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.py         # Authentication routes
│   │   │   └── backtest.py     # Backtesting routes
│   │   ├── services/           # Business logic
│   │   │   ├── auth_service.py # Authentication service
│   │   │   ├── backtest_service.py # Backtesting engine
│   │   │   └── data_service.py # Data fetching service
│   │   └── main.py             # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Backend container
│   └── init_db.py             # Database initialization
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── page.tsx        # Landing page
│   │   │   └── stock/page.tsx  # Main application
│   │   ├── components/         # React components
│   │   │   ├── AuthForm.tsx    # Authentication forms
│   │   │   ├── BacktestForm.tsx # Strategy input form
│   │   │   ├── ResultsDisplay.tsx # Results visualization
│   │   │   ├── EquityChart.tsx # Chart component
│   │   │   └── UserProfile.tsx # User management
│   │   └── lib/
│   │       └── api.ts          # API service layer
│   ├── package.json            # Node dependencies
│   └── Dockerfile              # Frontend container
├── docker-compose.yml          # Orchestration
├── nginx.conf                  # Reverse proxy config
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+ and Docker Compose 2.0+
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 🐳 Production Deployment (Recommended)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd stock-strategy-backtester
```

2. **Configure environment variables**:
```bash
# Backend environment
cat > backend/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/stock_backtester
POSTGRES_DB=stock_backtester
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Authentication
SECRET_KEY=your-super-secret-key-change-in-production-minimum-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost

# Analytics (Optional)
POSTHOG_KEY=your-posthog-key
EOF

# Frontend environment
cat > frontend/.env << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EOF
```

3. **Start the application**:
```bash
docker-compose up --build
```

4. **Access the application**:
- **Frontend**: http://localhost (via Nginx)
- **API Documentation**: http://localhost:8000/docs
- **Direct Backend**: http://localhost:8000
- **Direct Frontend**: http://localhost:3000

### 🛠️ Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (using Docker)
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=stock_backtester \
  -p 5432:5432 -d postgres:15

# Initialize database
python init_db.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔐 Authentication System

### User Roles & Permissions

| Role | Permissions | Features |
|------|-------------|----------|
| **User** | Basic backtesting, view own results | Standard strategy testing |
| **Premium** | Advanced analytics, risk metrics | Portfolio optimization, custom indicators |
| **Admin** | User management, system analytics | Full access, user role management |

### Default Test Users

After running `init_db.py`, these users are available:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `admin@stocktester.com` | `admin123456` | Admin | Full system access |
| `premium@stocktester.com` | `premium123456` | Premium | Premium features testing |
| `user@stocktester.com` | `user123456` | User | Basic functionality testing |

### Security Features

- **Password Security**: bcrypt hashing with salt
- **Token Security**: JWT with configurable expiration
- **Access Control**: Role-based endpoint protection
- **Data Isolation**: Users can only access their own data
- **CORS Protection**: Configurable origin restrictions

## 📊 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Backtesting Endpoints

#### Run Backtest
```http
POST /api/backtest
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "ticker": "AAPL",
  "start_date": "2022-01-01",
  "end_date": "2022-12-31",
  "sma_period": 10,
  "rule": {
    "if_condition": "price > sma",
    "then_action": "buy",
    "else_action": "hold"
  }
}
```

#### Get Backtest History
```http
GET /api/backtest-runs?skip=0&limit=10
Authorization: Bearer <jwt_token>
```

#### Get Available Tickers
```http
GET /api/tickers
Authorization: Bearer <jwt_token>
```

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /api/auth/users?skip=0&limit=100
Authorization: Bearer <admin_token>
```

#### Update User Role (Admin Only)
```http
PUT /api/auth/users/{user_id}/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "premium"
}
```

## 🎯 Strategy Configuration

### Supported Rules

**Conditions:**
- `price > sma` - Price above Simple Moving Average
- `price < sma` - Price below Simple Moving Average
- `volume > avg_volume` - Volume above average

**Actions:**
- `buy` - Open long position
- `sell` - Open short position
- `hold` - Maintain current position
- `exit` - Close all positions

### Example Strategies

**Simple SMA Crossover:**
```json
{
  "rule": {
    "if_condition": "price > sma",
    "then_action": "buy",
    "else_action": "sell"
  },
  "sma_period": 20
}
```

**Volume Breakout:**
```json
{
  "rule": {
    "if_condition": "volume > avg_volume",
    "then_action": "buy",
    "else_action": "hold"
  }
}
```

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your-jwt-secret-key-minimum-32-characters

# Optional
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost
POSTHOG_KEY=your-posthog-project-key
```

#### Frontend Configuration
```bash
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-project-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User authentication and profile data
- **backtest_runs**: Historical backtest results and parameters

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use the interactive API documentation at `http://localhost:8000/docs` for testing endpoints.

## 📈 Monitoring & Analytics

### Application Analytics
- **PostHog Integration**: User behavior tracking
- **Backtest Events**: Strategy performance analytics
- **User Engagement**: Feature usage metrics

### System Monitoring
- **Health Checks**: `/api/health` endpoint
- **Logging**: Structured logging with configurable levels
- **Error Tracking**: Global exception handling

## 🚀 Deployment

### Production Considerations

#### Security Checklist
- [ ] Change default `SECRET_KEY`
- [ ] Use strong database passwords
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable audit logging

#### Performance Optimization
- [ ] Configure database connection pooling
- [ ] Set up Redis for caching
- [ ] Enable CDN for static assets
- [ ] Configure horizontal scaling
- [ ] Set up database replicas

#### Infrastructure
- [ ] Set up backup strategies
- [ ] Configure monitoring and alerting
- [ ] Implement CI/CD pipelines
- [ ] Set up log aggregation
- [ ] Configure auto-scaling

### Supported Platforms
- **AWS**: ECS, EC2, RDS
- **Google Cloud**: Cloud Run, Compute Engine, Cloud SQL
- **Azure**: Container Instances, App Service, Database
- **DigitalOcean**: App Platform, Droplets
- **Any Docker-compatible platform**

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the coding standards
4. **Add tests** for new functionality
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices in frontend
- Use async/await patterns in backend
- Implement comprehensive error handling
- Add detailed logging for debugging
- Write unit tests for critical components
- Follow RESTful API design principles

## 📚 Documentation

- **API Documentation**: Available at `/docs` when running the backend
- **Architecture Decisions**: See `docs/architecture.md`
- **Deployment Guide**: See `docs/deployment.md`
- **Contributing Guidelines**: See `CONTRIBUTING.md`

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL
```

**Authentication Failures:**
```bash
# Verify SECRET_KEY is set
echo $SECRET_KEY

# Check token expiration
# Default: 30 minutes
```

**CORS Issues:**
```bash
# Verify CORS_ORIGINS includes your frontend URL
echo $CORS_ORIGINS
```

**Port Conflicts:**
```bash
# Check if ports are already in use
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000
```

### Debug Mode
Enable detailed logging:
```python
# In app/main.py
logging.basicConfig(level=logging.DEBUG)
```

## 📄 License

MIT License - see `LICENSE` file for details.

## 🙏 Acknowledgments

- **Backtrader**: For the excellent backtesting framework
- **FastAPI**: For the modern, fast API framework
- **Next.js**: For the powerful React framework
- **Chart.js**: For beautiful chart visualizations
- **PostHog**: For comprehensive analytics

---

**Made with ❤️ for the trading community**

For support, please open an issue or contact the maintainers. 