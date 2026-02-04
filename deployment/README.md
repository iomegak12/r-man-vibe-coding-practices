# R-MAN E-Commerce Microservices - Docker Deployment

This directory contains the Docker Compose configuration for deploying the complete R-MAN E-Commerce Customer Management System.

## 📋 Services Overview

| Service | Port | Technology | Description |
|---------|------|------------|-------------|
| **ATHS** | 5001 | Node.js 22 (Alpine) | Authentication Service |
| **CRMS** | 5002 | Python 3.12 (Alpine) | Customer Management Service |
| **ORMS** | 5003 | Python 3.12 (Alpine) | Order Management Service |
| **CMPS** | 5004 | Python 3.12 (Alpine) | Complaint Management Service |
| **Web App** | 3000 | Node.js 22 + Nginx (Alpine) | React Frontend Application |
| **MongoDB** | 27017 | MongoDB 7.0 | Shared Database |
| **Mongo Express** | 8081 | Latest | MongoDB Admin UI |
| **Seeder** | - | Node.js 22 (Alpine) | Database Seeder (runs once) |

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for Docker
- Ports 5001-5004, 8081, and 27017 available

### 1. Build and Start All Services

```bash
cd deployment
docker-compose up -d --build
```

The seeder service will automatically run after all services are started and populate the databases with sample data.

### 2. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f aths
docker-compose logs -f crms
docker-compose logs -f orms
docker-compose logs -f cmps
```

### 3. Check Service Status

```bash
docker-compose ps
```

### 4. Stop All Services

```bash
docker-compose down
```

### 5. Stop and Remove Volumes (⚠️ Deletes all data)

```bash
docker-compose down -v
```🌱 Sample Data

The seeder automatically creates:
- **5 Admin Users** (including admin@rman.com)
- **10 Customer Users** with profiles
- **100 Orders** (10 per customer)
- **500 Order Items** (5 per order)
- **30 Complaints** (3 per customer)
- **120 Comments** (4 per complaint)

**Default Login Credentials:**
- Email: `admin@rman.com`
- Password: `Rman123!`

All seeded users have the password: `Rman123!`

To re-seed the database, set `FORCE_SEEDING: true` in the seeder service environment and restart it:

```bash
docker-compose up seeder --force-recreate
```

## 

## 🔧 Configuration

### Environment Variables

**Before deployment, update these critical settings in `docker-compose.yml`:**

#### JWT Secret (All Services)
```yaml
JWT_SECRET: your_super_secret_jwt_key_change_this_in_production
```

#### Email Configuration (ATHS & CMPS)
```yaml
EMAIL_USER: your-email@gmail.com
EMAIL_PASSWORD: your-app-password  # Use Gmail App Password
EMAIL_FROM: noreply@rman-ecommerce.com
```

#### Service API Key (All Services)
```yaml
SERVICE_API_KEY: your_internal_service_api_key_change_this
```

#### CRMS Service API Key (ATHS)
```yaml
CRMS_SERVICE_API_KEY: b3a285fafe93756687343b95de0d4c82
```

#### MongoDB Credentials
```yaml
MONGO_INITDB_ROOT_USERNAME: admin
MONGO_INITDB_ROOT_PASSWORD: password123
```

## 📡 Access Points

Once deployed, access the services at:

### Frontend Application
- **Web App**: http://localhost:3000

### API Endpoints
- **ATHS API**: http://localhost:5001/api
- **ATHS Swagger**: http://localhost:5001/api-docs
- **CRMS API**: http://localhost:5002/api
- **CRMS Swagger**: http://localhost:5002/docs
- **ORMS API**: http://localhost:5003/api
- **ORMS Swagger**: http://localhost:5003/docs
- **CMPS API**: http://localhost:5004/api
- **CMPS Swagger**: http://localhost:5004/docs

### Database Management
- **Mongo Express**: http://localhost:8081 (admin/admin123)

## 🔍 Health Checks

Check if services are running:

```bash
# ATHS
curl http://localhost:5001/health

# CRMS
curl http://localhost:5002/health

# ORMS
curl http://localhost:5003/health

# CMPS
curl http://localhost:5004/health
```

## 📦 Persistent Volumes

Data is persisted in Docker volumes:

| Volume | Purpose |
|--------|---------|
| `rman-mongodb-data` | MongoDB database files |
| `rman-mongodb-config` | MongoDB configuration |
| `rman-aths-uploads` | ATHS file uploads |
| `rman-aths-logs` | ATHS service logs |
| `rman-crms-logs` | CRMS service logs |
| `rman-orms-logs` | ORMS service logs |
| `rman-cmps-logs` | CMPS service logs |

### View Volumes
```bash
docker volume ls | grep rman
```

### Backup MongoDB Data
```bash
docker exec rman-mongodb mongodump --out /data/backup
docker cp rman-mongodb:/data/backup ./mongodb-backup
```

## 🌐 Network

All services run on the `r-man-network` bridge network, allowing seamless inter-service communication using service names as hostnames.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       r-man-network                          │
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌─────────────┐  │
│  │ ATHS │  │ CRMS │  │ ORMS │  │ CMPS │  │   MongoDB   │  │
│  │ 5001 │  │ 5002 │  │ 5003 │  │ 5004 │  │    27017    │  │
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──────┬──────┘  │
│     │         │         │         │              │          │
│     └─────────┴─────────┴─────────┴──────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild specific service
docker-compose up -d --build <service-name>
```

### Port already in use
```bash
# Find process using port
netstat -ano | findstr :5001  # Windows
lsof -i :5001                 # Linux/Mac

# Stop the process or change port in docker-compose.yml
```

### MongoDB connection issues
```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Clear everything and restart
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📝 Development vs Production

This configuration is suitable for both development and production with minor adjustments:

### For Production:
1. ✅ Update all secrets and passwords
2. ✅ Set `NODE_ENV=production` and `ENVIRONMENT=production`
3. ✅ Configure proper email credentials
4. ✅ Enable rate limiting
5. ✅ Use proper SSL certificates (add reverse proxy like Nginx/Traefik)
6. ✅ Set up monitoring and logging aggregation
7. ✅ Configure backups for MongoDB volumes
8. ✅ Update CORS origins to specific domains

## 📄 License

Copyright © 2026 R-MAN Corporation, Bangalore
