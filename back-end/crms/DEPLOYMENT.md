# CRMS Deployment Guide

## Production Deployment Checklist

### 1. Environment Configuration

#### Required Environment Variables

```bash
# Service Configuration
SERVICE_NAME=Customer-Management-Service
SERVICE_VERSION=1.0.0
ENVIRONMENT=production
PORT=5002

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_MIN_POOL_SIZE=10
MONGODB_MAX_POOL_SIZE=100

# Authentication
JWT_SECRET=your-secure-jwt-secret-here-min-32-chars
SERVICE_API_KEY=your-secure-service-api-key-here

# Auth Service Integration
AUTH_SERVICE_URL=https://auth.yourdomain.com

# Service Integration
ORDER_SERVICE_URL=https://orders.yourdomain.com
COMPLAINT_SERVICE_URL=https://complaints.yourdomain.com

# Security
CORS_ORIGINS=["https://yourdomain.com","https://admin.yourdomain.com"]
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=INFO
```

### 2. Database Setup

#### MongoDB Indexes

Indexes are automatically created on startup. Verify they exist:

```javascript
use r-man-customers-db

// Check indexes
db.customers.getIndexes()

// Expected indexes:
// - userId_unique (unique)
// - email_index
// - customerStatus_index
// - customerType_index
// - status_type_compound
// - search_text_index
// - lastOrderDate_index
// - totalOrderValue_index
// - createdAt_index
```

#### Recommended MongoDB Configuration

```yaml
# MongoDB Replica Set for Production
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

replication:
  replSetName: rs0

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled
```

### 3. Security Hardening

#### ✅ Implemented Security Features

1. **Authentication & Authorization**
   - JWT token validation
   - Role-based access control (Customer, Admin)
   - Service API key authentication for internal endpoints

2. **Input Validation**
   - Pydantic schema validation
   - Email format validation
   - Phone number validation
   - ObjectId validation
   - Input sanitization to prevent XSS

3. **Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security
   - Content-Security-Policy
   - Referrer-Policy
   - Permissions-Policy

4. **Rate Limiting**
   - 100 requests/minute per IP
   - 1000 requests/hour per IP
   - (Note: Use Redis-based rate limiting for multi-instance deployments)

5. **CORS Configuration**
   - Configurable allowed origins
   - Credential support control

#### Additional Security Recommendations

1. **Use HTTPS in Production**
   ```nginx
   # Nginx reverse proxy configuration
   server {
       listen 443 ssl http2;
       server_name crms.yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:5002;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

2. **Rotate Secrets Regularly**
   - Change JWT_SECRET every 90 days
   - Rotate SERVICE_API_KEY periodically
   - Use secrets management (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)

3. **MongoDB Security**
   - Enable authentication
   - Use strong passwords
   - Restrict network access
   - Enable encryption at rest
   - Enable encryption in transit (TLS/SSL)

4. **Docker Security** (if containerized)
   - Run as non-root user
   - Use read-only filesystems where possible
   - Scan images for vulnerabilities
   - Use official base images

### 4. Performance Optimization

#### Database Optimization ✅

- Indexes on frequently queried fields
- Connection pooling (min: 10, max: 100)
- Aggregation pipeline optimization
- Denormalized user data for faster queries

#### Application Optimization

1. **Async Operations**
   - All database operations are async
   - Non-blocking I/O for external service calls
   - Concurrent request handling

2. **Caching Recommendations**
   ```python
   # Consider adding Redis caching for:
   # - Customer analytics (TTL: 5 minutes)
   # - Frequently accessed customer profiles (TTL: 1 minute)
   # - Search results (TTL: 30 seconds)
   ```

3. **Connection Pooling**
   - Already configured for MongoDB
   - Use HTTP connection pooling for external services

### 5. Monitoring & Logging

#### Structured Logging ✅

- JSON format in production
- Human-readable format in development
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

#### Log Types

1. **Request/Response Logging**
   - HTTP method, path, status code
   - Response time
   - Client IP, User Agent
   - User ID, email, role

2. **Performance Logging**
   - Operation duration
   - Slow query detection

3. **Database Logging**
   - Query type, collection
   - Operation duration

4. **External API Logging**
   - Service name, endpoint
   - Status code, duration

#### Monitoring Setup

**Application Metrics to Monitor:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Active connections
- Database connection pool usage

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

**Recommended Tools:**
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus + Grafana
- **APM**: New Relic, Datadog, or Application Insights
- **Uptime**: UptimeRobot, Pingdom

### 6. Deployment Methods

#### Option 1: Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Create non-root user
RUN useradd -m -u 1000 crmsuser && chown -R crmsuser:crmsuser /app
USER crmsuser

# Expose port
EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5002/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5002"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  crms:
    build: .
    ports:
      - "5002:5002"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/
      - ENVIRONMENT=production
      - LOG_LEVEL=INFO
    env_file:
      - .env.production
    depends_on:
      - mongo
    restart: unless-stopped
    
  mongo:
    image: mongo:7
    volumes:
      - crms_mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    restart: unless-stopped

volumes:
  crms_mongodb_data:
```

#### Option 2: Systemd Service

```ini
# /etc/systemd/system/crms.service
[Unit]
Description=Customer Management Service
After=network.target mongodb.service

[Service]
Type=simple
User=crmsuser
WorkingDirectory=/opt/crms
Environment="PATH=/opt/crms/venv/bin"
EnvironmentFile=/opt/crms/.env.production
ExecStart=/opt/crms/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 5002 --workers 4
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable crms
sudo systemctl start crms
sudo systemctl status crms
```

#### Option 3: Cloud Deployment

**AWS Elastic Beanstalk:**
```yaml
# .ebextensions/python.config
option_settings:
  aws:elasticbeanstalk:application:environment:
    PYTHONPATH: "/var/app/current:$PYTHONPATH"
  aws:elasticbeanstalk:container:python:
    WSGIPath: app.main:app
```

**Azure App Service:**
```bash
az webapp create --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name crms-api \
  --runtime "PYTHON:3.11"

az webapp config appsettings set --resource-group myResourceGroup \
  --name crms-api \
  --settings @appsettings.json
```

**Google Cloud Run:**
```bash
gcloud run deploy crms-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 7. Health Checks & Readiness

#### Health Endpoints

```bash
# Basic health check
curl http://localhost:5002/health

# Database connectivity check
# (Already verified by MongoDB ping in startup)
```

#### Load Balancer Configuration

```yaml
# Health check settings
health_check:
  path: /health
  interval: 10s
  timeout: 5s
  healthy_threshold: 2
  unhealthy_threshold: 3
```

### 8. Backup & Disaster Recovery

#### MongoDB Backup

```bash
# Automated daily backup
mongodump --uri="mongodb://localhost:27017/r-man-customers-db" \
  --out="/backup/crms-$(date +%Y%m%d)"

# Compress backup
tar -czf /backup/crms-$(date +%Y%m%d).tar.gz /backup/crms-$(date +%Y%m%d)

# Upload to cloud storage (AWS S3)
aws s3 cp /backup/crms-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/crms/
```

#### Restore Procedure

```bash
# Download backup
aws s3 cp s3://your-backup-bucket/crms/crms-20260127.tar.gz .

# Extract
tar -xzf crms-20260127.tar.gz

# Restore
mongorestore --uri="mongodb://localhost:27017/r-man-customers-db" \
  crms-20260127/r-man-customers-db/
```

### 9. Testing in Production

```bash
# Run comprehensive integration tests
cd /opt/crms
source venv/bin/activate
python test_comprehensive_integration.py

# Load testing with Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer <token>" \
  http://localhost:5002/api/customers

# Or use k6 for advanced load testing
k6 run load-test.js
```

### 10. Rollback Procedure

1. **Identify the Issue**
   - Check logs: `journalctl -u crms -n 100`
   - Check metrics dashboard

2. **Stop Current Version**
   ```bash
   sudo systemctl stop crms
   ```

3. **Restore Previous Version**
   ```bash
   cd /opt/crms
   git checkout <previous-stable-tag>
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Start Service**
   ```bash
   sudo systemctl start crms
   ```

5. **Verify**
   ```bash
   curl http://localhost:5002/health
   ```

### 11. Post-Deployment Checklist

- [ ] All services are running and healthy
- [ ] Database connections are established
- [ ] Indexes are created
- [ ] Health checks pass
- [ ] Authentication works (login test)
- [ ] Authorization works (role test)
- [ ] Service integrations work (ORMS, CMPS)
- [ ] Logs are being generated
- [ ] Metrics are being collected
- [ ] Backups are configured
- [ ] SSL certificates are valid
- [ ] Rate limiting is active
- [ ] Error handling works
- [ ] Performance is acceptable (< 200ms avg response time)

### 12. Troubleshooting

#### Common Issues

1. **Service won't start**
   - Check MongoDB connectivity
   - Verify environment variables
   - Check port availability: `lsof -i :5002`

2. **Authentication failures**
   - Verify JWT_SECRET matches across services
   - Check Auth Service connectivity
   - Verify token expiration settings

3. **Slow performance**
   - Check database indexes
   - Monitor connection pool usage
   - Check external service response times
   - Review slow query logs

4. **Service integration failures**
   - Verify SERVICE_API_KEY matches
   - Check network connectivity
   - Verify service URLs
   - Check firewall rules

## Support

For issues or questions:
- Email: jd.ramkumar@gmail.com
- Documentation: http://localhost:5002/docs
