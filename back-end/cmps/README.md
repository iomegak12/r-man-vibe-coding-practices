# Complaint Management Service (CMPS)

Complaint Management Service for the R-MAN E-Commerce Customer Management System.

## Overview

The Complaint Management Service (CMPS) handles customer complaint registration, tracking, resolution, and admin complaint management.

## Features

- Complaint registration (order-linked and general)
- Complaint status tracking and lifecycle management
- Admin assignment and resolution workflows
- Comments and communication system
- Complaint analytics and reporting
- Email notifications for complaint events

## Technology Stack

- **Framework**: FastAPI
- **Database**: MongoDB
- **Language**: Python 3.12+
- **Port**: 8003

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env` file

3. Run the service:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 5004 --reload
```

## API Documentation

Once running, access the API documentation at:
- Swagger UI: http://localhost:8003/docs
- ReDoc: http://localhost:8003/redoc

## Database Collections

- **complaints**: Main complaint records
- **complaint_comments**: Comments and communication
- **complaint_history**: Audit trail for changes
- **complaint_assignments**: Admin assignment tracking

## Service Dependencies

- Auth Service (port 3001): User authentication
- Customer Service (port 5001): Customer data and statistics
- Order Service (port 5003): Order information for linked complaints

## Development

### Project Structure

```
cmps/
├── app/
│   ├── config/         # Configuration files
│   ├── schemas/        # Pydantic models
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   ├── middleware/     # Middleware components
│   ├── dependencies/   # Dependency injection
│   ├── utils/          # Utility functions
│   └── main.py         # Application entry point
├── tests/              # Test files
├── .env                # Environment variables
└── requirements.txt    # Python dependencies
```

## Environment Variables

See `.env` file for required configuration variables.

## License

Copyright © 2026 R-MAN Corporation, Bangalore
