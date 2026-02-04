# ORMS - Order Management Service Dockerfile
# Python 3.12 Alpine-based image

FROM python:3.12-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p logs

# Expose port
EXPOSE 5003

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5003"]
