# Authentication System Setup Guide

This guide explains how to set up and use the authentication system for the Stock Strategy Backtester.

## Overview

The authentication system provides:
- **JWT-based authentication** with secure token handling
- **Role-based access control** with three user roles: `user`, `premium`, and `admin`
- **Password hashing** using bcrypt for security
- **User management** for administrators
- **Premium features** for premium users

## User Roles

### 1. Regular User (`user`)
- Basic backtesting functionality
- View their own backtest runs
- Limited to basic features

### 2. Premium User (`premium`)
- All regular user features
- Access to advanced analytics
- Risk-adjusted returns
- Portfolio optimization
- Custom strategy builder

### 3. Administrator (`admin`)
- All premium user features
- User management capabilities
- System analytics
- Can view all backtest runs
- Can modify user roles

## Setup Instructions

### 1. Database Migration

This script will:
- Create the `users` table with authentication fields
- Add `user_id` foreign key to `backtest_runs` table
- Create test users for each role

### 2. Environment Variables

Add these environment variables to your `.env` file:

```env
# Authentication
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/stock_backtester

# CORS
CORS_ORIGINS=http://localhost:3000
```

### 3. Start the Application

```bash
# Backend
cd backend
python -m uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Test Users

After running the setup script, these test users will be available:

| Email | Password | Role | Features |
|-------|----------|------|----------|
| `admin@stocktester.com` | `admin123456` | Admin | All features + user management |
| `premium@stocktester.com` | `premium123456` | Premium | Advanced analytics + premium features |
| `user@stocktester.com` | `user123456` | User | Basic backtesting |

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User Info
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "role": "premium"
}
```

#### Change Password
```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /auth/users?skip=0&limit=100
Authorization: Bearer <admin_token>
```

#### Update User Role (Admin Only)
```http
PUT /auth/users/{user_id}/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "premium"
}
```

#### Deactivate User (Admin Only)
```http
DELETE /auth/users/{user_id}
Authorization: Bearer <admin_token>
```

### Protected Endpoints

All backtesting endpoints now require authentication:

#### Run Backtest
```http
POST /backtest
Authorization: Bearer <token>
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

#### Get Backtest Runs
```http
GET /backtest-runs?skip=0&limit=10
Authorization: Bearer <token>
```

#### Get Specific Backtest Run
```http
GET /backtest-runs/{run_id}
Authorization: Bearer <token>
```

### Premium Endpoints

#### Advanced Analytics (Premium/Admin Only)
```http
GET /premium/advanced-analytics
Authorization: Bearer <premium_token>
```

## Frontend Integration

### Authentication Flow

1. **Login/Register**: Users must authenticate before accessing the application
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Automatic Token Inclusion**: All API requests automatically include the auth token
4. **Token Expiration**: Expired tokens automatically redirect to login
5. **Role-based UI**: Different features are shown based on user role

### Components

- `AuthForm`: Login and registration forms
- `UserProfile`: User profile dropdown with role information
- Protected routes and role-based feature access

## Security Features

### Password Security
- Passwords are hashed using bcrypt
- Minimum 8 character requirement
- Secure password verification

### Token Security
- JWT tokens with configurable expiration
- Automatic token refresh handling
- Secure token storage in localStorage

### Role-based Access Control
- Server-side role verification
- Client-side role-based UI rendering
- Protected API endpoints

### Database Security
- Foreign key constraints
- User isolation (users can only see their own data)
- Admin override capabilities

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Ensure PostgreSQL is running
   - Check database connection string
   - Verify database user permissions

2. **Authentication Errors**
   - Check SECRET_KEY environment variable
   - Verify token expiration settings
   - Ensure CORS is properly configured

3. **Role Access Denied**
   - Verify user role in database
   - Check role-based decorators
   - Ensure proper token inclusion

### Debug Mode

Enable debug logging by setting the log level:

```python
# In app/main.py
logging.basicConfig(level=logging.DEBUG)
```

## Production Considerations

### Security
- Change default SECRET_KEY
- Use HTTPS in production
- Implement rate limiting
- Add request validation
- Consider token refresh mechanism

### Performance
- Add database indexes
- Implement caching
- Optimize database queries
- Consider connection pooling

### Monitoring
- Add authentication metrics
- Monitor failed login attempts
- Track user activity
- Implement audit logging

## Support

For issues or questions about the authentication system:
1. Check the logs for error messages
2. Verify environment variables
3. Test with provided test users
4. Review the API documentation at `/docs`

## Files Modified/Added

### Backend
- `app/models/schemas.py` - Added auth schemas
- `app/models/database.py` - Updated User and BacktestRun models
- `app/services/auth_service.py` - New authentication service
- `app/routes/auth.py` - New authentication routes
- `app/main.py` - Updated with auth integration
- `migrations/add_auth_tables.py` - Database migration script
- `setup_auth.py` - Setup script

### Frontend
- `src/components/AuthForm.tsx` - Authentication forms
- `src/components/UserProfile.tsx` - User profile component
- `src/app/page.tsx` - Updated with auth flow
- `src/lib/api.ts` - Added token handling

This authentication system provides a solid foundation for user management and role-based access control in your stock strategy backtester application. 