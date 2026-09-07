#!/bin/bash

# Navigate to backend directory
cd backend

# Run database migrations
echo "Running database migrations..."
python migrate.py

# Start the FastAPI application
echo "Starting FastAPI application..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
