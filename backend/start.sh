#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Initialize database
echo "Initializing database..."
python /app/init_db.py || { echo "Database initialization failed"; exit 1; }

# Start the application server
echo "Starting application server..."
python /app/main.py

# Start the application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload