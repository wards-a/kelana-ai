# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ ./backend/
COPY start.sh .

# Make start script executable
RUN chmod +x start.sh

# Expose port (will be overridden by $PORT on most platforms)
EXPOSE 8000

# Set environment variable for Python
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["bash", "start.sh"]
