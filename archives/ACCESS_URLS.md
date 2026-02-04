# 🌐 R-MAN E-Commerce - Traefik Access URLs

## Quick Reference Guide

### 🎯 Production URLs (via Traefik HTTPS)

#### Main Application
```
https://rman.localhost
https://localhost
```

#### Microservices (Host-based)
```
https://auth.localhost          # Authentication Service
https://customers.localhost     # Customer Management
https://orders.localhost         # Order Management
https://complaints.localhost    # Complaint Management
```

#### Microservices (Path-based)
```
https://localhost/api/auth        # Authentication Service
https://localhost/api/customers   # Customer Management
https://localhost/api/orders      # Order Management
https://localhost/api/complaints  # Complaint Management
```

#### Management Interfaces
```
http://localhost:8080           # Traefik Dashboard
http://traefik.localhost        # Traefik Dashboard (alternative)
https://db.localhost            # Mongo Express (admin/admin123)
http://localhost:8081           # Mongo Express (direct)
```

---

### 🔧 Development URLs (Direct Access)

Use these for debugging or when Traefik is not running:

#### Frontend
```
http://localhost:3000           # Web Application
```

#### Microservices
```
http://localhost:5001/api       # ATHS - Authentication
http://localhost:5001/api-docs  # ATHS Swagger Docs

http://localhost:5002/api       # CRMS - Customer Management
http://localhost:5002/docs      # CRMS Swagger Docs

http://localhost:5003/api       # ORMS - Order Management
http://localhost:5003/docs      # ORMS Swagger Docs

http://localhost:5004/api       # CMPS - Complaint Management
http://localhost:5004/docs      # CMPS Swagger Docs
```

#### Database
```
http://localhost:8081           # Mongo Express
mongodb://localhost:27017       # MongoDB (admin/password123)
```

---

## 🔒 Security Notes

### SSL Certificates
- Self-signed certificates used in development
- Browser will show security warning - click "Advanced" → "Proceed"
- Production should use Let's Encrypt or commercial certificates

### HTTP to HTTPS
All HTTP requests automatically redirect to HTTPS:
```bash
http://localhost → https://localhost
http://auth.localhost → https://auth.localhost
```

---

## 🧪 Testing Commands

### Test HTTPS Connectivity
```bash
# Test main app (ignore self-signed cert)
curl -k https://localhost

# Test authentication service
curl -k https://auth.localhost/api/health

# Test customer service
curl -k https://customers.localhost/api/health

# Test order service
curl -k https://orders.localhost/api/health

# Test complaint service
curl -k https://complaints.localhost/api/health
```

### Test HTTP → HTTPS Redirect
```bash
# Should return 301 redirect
curl -I http://localhost
curl -I http://auth.localhost
curl -I http://customers.localhost
```

### Test API Endpoints
```bash
# Login via Traefik HTTPS
curl -k -X POST https://auth.localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rman.com","password":"Rman123!"}'

# Get customers via Traefik HTTPS
curl -k https://customers.localhost/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Traefik Dashboard Navigation

Access: **http://localhost:8080**

### Dashboard Sections

1. **HTTP Routers**
   - `aths` → https://auth.localhost
   - `aths-insecure` → http://auth.localhost (redirects)
   - `crms` → https://customers.localhost
   - `orms` → https://orders.localhost
   - `cmps` → https://complaints.localhost
   - `web` → https://localhost
   - `mongo-express` → https://db.localhost

2. **HTTP Services**
   - `aths@docker` → rman-aths:5001
   - `crms@docker` → rman-crms:5002
   - `orms@docker` → rman-orms:5003
   - `cmps@docker` → rman-cmps:5004
   - `web@docker` → rman-web:3000
   - `mongo-express@docker` → rman-mongo-express:8081

3. **HTTP Middlewares**
   - `aths-redirect` → HTTP to HTTPS redirect
   - `crms-redirect` → HTTP to HTTPS redirect
   - `orms-redirect` → HTTP to HTTPS redirect
   - `cmps-redirect` → HTTP to HTTPS redirect
   - `web-redirect` → HTTP to HTTPS redirect
   - `mongo-express-redirect` → HTTP to HTTPS redirect

4. **Entrypoints**
   - `web` → Port 80 (HTTP) - redirects to websecure
   - `websecure` → Port 443 (HTTPS) - SSL termination

---

## 🔍 Troubleshooting URLs

### Issue: "Site can't be reached"

**For .localhost domains:**
```bash
# Windows: Test DNS resolution
nslookup auth.localhost
ping auth.localhost

# Should resolve to 127.0.0.1
# If not, add to hosts file:
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1 auth.localhost
127.0.0.1 customers.localhost
127.0.0.1 orders.localhost
127.0.0.1 complaints.localhost
127.0.0.1 db.localhost
127.0.0.1 rman.localhost
127.0.0.1 traefik.localhost
```

**Linux/Mac:**
```bash
# Add to /etc/hosts
sudo echo "127.0.0.1 auth.localhost customers.localhost orders.localhost complaints.localhost db.localhost rman.localhost traefik.localhost" >> /etc/hosts
```

### Issue: SSL Certificate Warning

This is normal for self-signed certificates.

**Chrome/Edge:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"

**Firefox:**
1. Click "Advanced"
2. Click "Accept the Risk and Continue"

**Bypass in curl:**
```bash
curl -k https://localhost  # -k flag ignores SSL verification
```

---

## 📝 Default Credentials

### Application Login
```
Email: admin@rman.com
Password: Rman123!
```

### Mongo Express
```
Username: admin
Password: admin123
```

### MongoDB
```
Username: admin
Password: password123
```

---

## 🚦 Service Status Check

```bash
# Check all containers
docker-compose ps

# Specific services
docker-compose ps traefik
docker-compose ps aths
docker-compose ps crms
docker-compose ps orms
docker-compose ps cmps
docker-compose ps web
docker-compose ps mongodb
docker-compose ps mongo-express

# View Traefik logs
docker-compose logs -f traefik

# Check certificate download
docker-compose logs traefik | grep -i cert
```

---

## 📌 Browser Bookmarks (Recommended)

Add these to your browser for quick access:

**Production (Traefik HTTPS):**
- https://localhost - Main Application
- https://auth.localhost - Auth Service
- https://customers.localhost - Customer Service
- https://orders.localhost - Order Service
- https://complaints.localhost - Complaint Service
- http://localhost:8080 - Traefik Dashboard
- https://db.localhost - Mongo Express

**Development (Direct):**
- http://localhost:3000 - Web App (Direct)
- http://localhost:5001/api-docs - Auth API Docs
- http://localhost:5002/docs - Customer API Docs
- http://localhost:5003/docs - Order API Docs
- http://localhost:5004/docs - Complaint API Docs

---

## 🎯 Recommended Workflow

### For Frontend Development
```
Use: https://localhost (Traefik HTTPS)
Why: Tests production-like SSL setup
```

### For Backend API Testing
```
Use: https://auth.localhost, https://customers.localhost, etc.
Why: Clean URLs, service isolation
```

### For API Documentation
```
Use: http://localhost:5001/api-docs (Direct)
Why: Swagger UI works best without SSL warnings
```

### For Database Management
```
Use: http://localhost:8081 (Direct)
Why: Simpler access, no SSL needed
```

### For Monitoring
```
Use: http://localhost:8080 (Traefik Dashboard)
Why: Real-time view of all routes and services
```

---

## 🔄 Quick Start Commands

```bash
# Start all services
cd deployment
docker-compose up -d

# Wait for startup (30 seconds)
timeout 30  # Windows
sleep 30    # Linux/Mac

# Open in browser
start https://localhost                    # Windows
xdg-open https://localhost                 # Linux
open https://localhost                     # Mac

# View Traefik dashboard
start http://localhost:8080                # Windows
xdg-open http://localhost:8080             # Linux
open http://localhost:8080                 # Mac

# Login to application
# Email: admin@rman.com
# Password: Rman123!
```

---

## ✅ Health Check

Verify all services are accessible:

```bash
# Check HTTPS routes
curl -k https://localhost
curl -k https://auth.localhost/api/health
curl -k https://customers.localhost/api/health
curl -k https://orders.localhost/api/health
curl -k https://complaints.localhost/api/health

# All should return 200 OK
```

If any fail, check Traefik dashboard: http://localhost:8080

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-24  
**Platform:** R-MAN E-Commerce Microservices
