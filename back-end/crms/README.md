# Customer Management Service (CRMS)

## R-MAN E-Commerce Customer Management System

The Customer Management Service (CRMS) manages customer business data, statistics, and relationships for the R-MAN E-Commerce platform. Built with Python FastAPI and MongoDB.

## 🚀 Features

- Customer profile management
- Customer statistics tracking (orders, complaints)
- Admin customer management
- Customer search and filtering
- Service-to-service integration
- Data denormalization for performance

## 📋 Prerequisites

- Python 3.11+
- MongoDB 6.0+
- Virtual environment activated

## 🛠️ Installation

1. **Navigate to service directory**
   ```bash
   cd back-end/crms
   ```

2. **Activate virtual environment** (from vibe-coding root)
   ```bash
   # From root directory
   env\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update values as needed

5. **Ensure MongoDB is running**
   ```bash
   # MongoDB should already be running in Docker
   # Database: r-man-customers-db
   ```

## 🚀 Running the Service

**Development mode**
```bash
uvicorn app.main:app --reload --port 5002
```

The service will be available at `http://localhost:5002`

## 📚 API Documentation

Once running, access:
- **Swagger UI**: http://localhost:5002/docs
- **ReDoc**: http://localhost:5002/redoc
- **Health Check**: http://localhost:5002/health

## 🗂️ Project Structure

```
crms/
├── app/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── schemas/         # Pydantic schemas
│   ├── routers/         # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Middleware
│   ├── utils/           # Utilities
│   └── dependencies/    # Dependencies
├── tests/               # Tests
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
└── README.md
```

## 🔧 Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `PORT`: Service port (default: 5002)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret for token validation
- `SERVICE_API_KEY`: Service-to-service API key

## 📖 Documentation

For complete implementation guide, see [Customer-Service-Implementation-Guide.md](../../docs/Customer-Service-Implementation-Guide.md)

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
