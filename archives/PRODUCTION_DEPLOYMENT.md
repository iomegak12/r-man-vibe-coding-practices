# 🚀 R-MAN E-Commerce Production Deployment Guide

## 📋 Overview

This guide provides instructions for deploying the R-MAN E-Commerce platform on production infrastructure using the **r-man.work.gd** domain with wildcard SSL certificates.

## 🌐 Domain Configuration

### Production URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Main Application** | https://r-man.work.gd | React Frontend |
| **Authentication** | https://aths.r-man.work.gd | ATHS API |
| **Customer Management** | https://crms.r-man.work.gd | CRMS API |
| **Order Management** | https://orms.r-man.work.gd | ORMS API |
| **Complaint Management** | https://cmps.r-man.work.gd | CMPS API |
| **Database Admin** | https://db.r-man.work.gd | Mongo Express |
| **Traefik Dashboard** | https://traefik.r-man.work.gd | Traefik Monitoring |

### Alternative Main Domain
- https://www.r-man.work.gd (redirects to https://r-man.work.gd)

## 🔐 Security Configuration

### Applied Settings

**SERVICE_API_KEY**: `r-man-8vn6vR0XZm5OQYsES5vPLGHPD5tYCUHf`
- Used for internal service-to-service communication
- Configured in all microservices (ATHS, CRMS, ORMS, CMPS)

**JWT_SECRET**: `3c85c0cc01b287ebbb38d4fe0ae44fea`
- Used for JWT token signing and verification
- Configured in all services for authentication

**CORS_ORIGINS**: `*`
- Allows requests from any origin (configure restrictively for production)
- Applied to all API services

### Email Configuration (Gmail)

All email notifications use the following configuration:

```yaml
EMAIL_SERVICE: gmail
EMAIL_HOST: smtp.gmail.com
EMAIL_PORT: 587
EMAIL_SECURE: false
EMAIL_USER: jd.ramkumar@gmail.com
EMAIL_PASSWORD: laftvegmmgonuvmf
EMAIL_FROM: noreply@rman-ecommerce.com
EMAIL_FROM_NAME: R-MAN E-Commerce
```

**Services using email:**
- ATHS: Password reset, email verification
- CMPS: Complaint notifications

## 🏗️ Deployment Options

### Option 1: Development/Build Environment

Use `docker-compose.yml` for environments where you want to build images from source:

```bash
cd deployment
docker-compose up -d --build
```

**Features:**
- ✅ Builds all images from source code
- ✅ Useful for development and CI/CD pipelines
- ✅ Images tagged as `rman/service:rmanv1`

### Option 2: Production Environment

Use `docker-compose.prod.yml` for production deployments with pre-built images:

```bash
cd deployment
docker-compose -f docker-compose.prod.yml up -d
```

**Features:**
- ✅ Uses pre-built images (no build context)
- ✅ Faster deployment
- ✅ Requires images to be built and pushed to registry first
- ✅ Ideal for production servers

## 📦 Container Images

All services use the `rmanv1` tag:

| Service | Image | Tag |
|---------|-------|-----|
| ATHS | rman/aths | rmanv1 |
| CRMS | rman/crms | rmanv1 |
| ORMS | rman/orms | rmanv1 |
| CMPS | rman/cmps | rmanv1 |
| Web | rman/web | rmanv1 |
| Seeder | rman/seeder | rmanv1 |
| Traefik | rman/traefik | rmanv1 |

## 🔧 Pre-Deployment Steps

### 1. Build and Tag Images (Development Environment)

```bash
# Navigate to deployment directory
cd deployment

# Build all images
docker-compose build

# Verify images
docker images | grep rman
```

Expected output:
```
rman/aths        rmanv1    <image-id>    <timestamp>    <size>
rman/crms        rmanv1    <image-id>    <timestamp>    <size>
rman/orms        rmanv1    <image-id>    <timestamp>    <size>
rman/cmps        rmanv1    <image-id>    <timestamp>    <size>
rman/web         rmanv1    <image-id>    <timestamp>    <size>
rman/seeder      rmanv1    <image-id>    <timestamp>    <size>
rman/traefik     rmanv1    <image-id>    <timestamp>    <size>
```

### 2. Push Images to Registry (Optional - for remote deployment)

If deploying to a remote server, push images to Docker Hub or private registry:

```bash
# Login to Docker Hub
docker login

# Push all images
docker push rman/aths:rmanv1
docker push rman/crms:rmanv1
docker push rman/orms:rmanv1
docker push rman/cmps:rmanv1
docker push rman/web:rmanv1
docker push rman/seeder:rmanv1
docker push rman/traefik:rmanv1
```

### 3. SSL Certificate Setup

The wildcard SSL certificate for `*.r-man.work.gd` is automatically downloaded by Traefik from GitHub:

**Certificate URL**: https://github.com/iomegak12/app-deployment-artifacts/raw/refs/heads/main/r-man-work-gd-certificates.zip

**Expected files:**
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

**Traefik automatically:**
1. Downloads certificates on startup
2. Extracts to `/etc/traefik/certs/`
3. Configures TLS with minimum version TLS 1.2
4. Enables SNI strict mode

### 4. DNS Configuration

Ensure DNS records are configured for all subdomains:

```
# A Records (or CNAME to server IP)
r-man.work.gd           →  <server-ip>
www.r-man.work.gd       →  <server-ip>
aths.r-man.work.gd      →  <server-ip>
crms.r-man.work.gd      →  <server-ip>
orms.r-man.work.gd      →  <server-ip>
cmps.r-man.work.gd      →  <server-ip>
db.r-man.work.gd        →  <server-ip>
traefik.r-man.work.gd   →  <server-ip>
```

**Verify DNS resolution:**
```bash
nslookup aths.r-man.work.gd
nslookup crms.r-man.work.gd
nslookup orms.r-man.work.gd
nslookup cmps.r-man.work.gd
nslookup traefik.r-man.work.gd
nslookup db.r-man.work.gd
```

## 🚀 Production Deployment

### Step 1: Transfer Files to Server

If deploying to a remote server:

```bash
# Copy production compose file
scp docker-compose.prod.yml user@server:/opt/rman/

# Or use the build-enabled compose file
scp docker-compose.yml user@server:/opt/rman/
```

### Step 2: Start Services

**Option A: Using production compose file (pre-built images)**
```bash
cd /opt/rman
docker-compose -f docker-compose.prod.yml up -d
```

**Option B: Using development compose file (build from source)**
```bash
cd /opt/rman
docker-compose up -d --build
```

### Step 3: Monitor Startup

```bash
# Watch all container logs
docker-compose -f docker-compose.prod.yml logs -f

# Watch specific services
docker-compose -f docker-compose.prod.yml logs -f traefik
docker-compose -f docker-compose.prod.yml logs -f aths
docker-compose -f docker-compose.prod.yml logs -f seeder
```

**Expected logs:**

**Traefik:**
```
🔐 Starting SSL certificate download...
📥 Downloading certificates from GitHub...
✅ Certificates downloaded successfully
📦 Extracting certificates...
🔒 Certificate permissions set
✅ SSL certificates ready!
🚀 Starting Traefik...
```

**Seeder:**
```
⏳ Waiting for all services to be ready...
🌱 Starting database seeding...
✅ Database seeding completed!
```

### Step 4: Verify Deployment

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Expected status: All containers "Up"
```

### Step 5: Test Services

```bash
# Test HTTPS endpoints
curl -I https://r-man.work.gd
curl -I https://aths.r-man.work.gd/api/health
curl -I https://crms.r-man.work.gd/api/health
curl -I https://orms.r-man.work.gd/api/health
curl -I https://cmps.r-man.work.gd/api/health

# All should return: HTTP/2 200
```

### Step 6: Access Dashboard

Open browser and navigate to:
- **Traefik Dashboard**: https://traefik.r-man.work.gd

Verify all routes show "UP" status.

## 🔍 Post-Deployment Verification

### 1. SSL Certificate Check

```bash
# Check certificate validity
openssl s_client -connect aths.r-man.work.gd:443 -servername aths.r-man.work.gd < /dev/null | openssl x509 -noout -dates

# Check certificate issuer
openssl s_client -connect aths.r-man.work.gd:443 -servername aths.r-man.work.gd < /dev/null | openssl x509 -noout -issuer
```

### 2. Service Health Checks

```bash
# ATHS Health
curl https://aths.r-man.work.gd/api/health

# CRMS Health
curl https://crms.r-man.work.gd/api/health

# ORMS Health
curl https://orms.r-man.work.gd/api/health

# CMPS Health
curl https://cmps.r-man.work.gd/api/health
```

### 3. Authentication Test

```bash
# Login test
curl -X POST https://aths.r-man.work.gd/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rman.com","password":"Rman123!"}'

# Should return: JWT token
```

### 4. Database Verification

Access Mongo Express:
- URL: https://db.r-man.work.gd
- Username: `admin`
- Password: `admin123`

Verify databases exist:
- `auth_db` - User authentication data
- `r-man-customers-db` - Customer profiles
- `r-man-orders-db` - Order information
- `complaint_db` - Complaint records

## 📊 Monitoring

### Container Status

```bash
# View all containers
docker-compose -f docker-compose.prod.yml ps

# View resource usage
docker stats
```

### Log Management

```bash
# View logs for all services
docker-compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f aths

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 aths
```

### Traefik Monitoring

Access the Traefik dashboard at: https://traefik.r-man.work.gd

**Dashboard sections:**
- **HTTP Routers**: View all configured routes and their status
- **HTTP Services**: See backend service health
- **HTTP Middlewares**: Check redirect and security middleware
- **Entrypoints**: Monitor port 80 (HTTP) and 443 (HTTPS) traffic

## 🔄 Updates and Maintenance

### Update Services

**Option 1: Rebuild and redeploy**
```bash
# Rebuild all images
docker-compose build

# Recreate services
docker-compose up -d --force-recreate
```

**Option 2: Pull updated images**
```bash
# Pull latest images from registry
docker-compose -f docker-compose.prod.yml pull

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

### Database Backup

```bash
# Backup MongoDB
docker exec rman-mongodb mongodump --out /data/backup

# Copy backup to host
docker cp rman-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Certificate Renewal

Traefik automatically downloads certificates on restart:

```bash
# Restart Traefik to refresh certificates
docker-compose -f docker-compose.prod.yml restart traefik

# Verify certificate download
docker-compose -f docker-compose.prod.yml logs traefik | grep -i cert
```

## 🛑 Shutdown

### Graceful Shutdown

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ Deletes all data)
docker-compose -f docker-compose.prod.yml down -v
```

### Stop Specific Service

```bash
docker-compose -f docker-compose.prod.yml stop aths
docker-compose -f docker-compose.prod.yml start aths
```

## 🐛 Troubleshooting

### Issue: Service Not Accessible

**Check DNS resolution:**
```bash
nslookup aths.r-man.work.gd
```

**Check container status:**
```bash
docker-compose -f docker-compose.prod.yml ps aths
```

**Check service logs:**
```bash
docker-compose -f docker-compose.prod.yml logs --tail=50 aths
```

### Issue: SSL Certificate Error

**Check certificate download:**
```bash
docker-compose -f docker-compose.prod.yml logs traefik | grep -i cert
```

**Verify certificate files:**
```bash
docker exec rman-traefik ls -la /etc/traefik/certs/
```

**Restart Traefik:**
```bash
docker-compose -f docker-compose.prod.yml restart traefik
```

### Issue: Database Connection Failed

**Check MongoDB status:**
```bash
docker-compose -f docker-compose.prod.yml ps mongodb
```

**Check MongoDB logs:**
```bash
docker-compose -f docker-compose.prod.yml logs mongodb
```

**Restart MongoDB:**
```bash
docker-compose -f docker-compose.prod.yml restart mongodb
```

## 📝 Environment Variables Summary

### Critical Configuration

| Variable | Value | Services |
|----------|-------|----------|
| JWT_SECRET | `3c85c0cc01b287ebbb38d4fe0ae44fea` | All |
| SERVICE_API_KEY | `r-man-8vn6vR0XZm5OQYsES5vPLGHPD5tYCUHf` | All |
| CORS_ORIGINS | `*` | CRMS, ORMS, CMPS |
| EMAIL_USER | `jd.ramkumar@gmail.com` | ATHS, CMPS |
| EMAIL_PASSWORD | `laftvegmmgonuvmf` | ATHS, CMPS |

### MongoDB Credentials

| Variable | Value |
|----------|-------|
| MONGO_INITDB_ROOT_USERNAME | `admin` |
| MONGO_INITDB_ROOT_PASSWORD | `password123` |

### Default Application Credentials

| Variable | Value |
|----------|-------|
| Email | `admin@rman.com` |
| Password | `Rman123!` |

## 🎯 Production Checklist

Before going live:

- ✅ DNS records configured for all subdomains
- ✅ SSL certificates downloaded and verified
- ✅ All environment variables configured
- ✅ Database seeded with initial data
- ✅ All services health checks passing
- ✅ Traefik routing configured correctly
- ✅ Email service tested and working
- ✅ Backup strategy in place
- ✅ Monitoring and logging configured
- ✅ Security settings reviewed

## 📞 Support

For issues or questions during deployment:
1. Check service logs: `docker-compose logs <service>`
2. Verify DNS configuration
3. Check Traefik dashboard: https://traefik.r-man.work.gd
4. Review this deployment guide

---

**Deployment Guide Version:** 1.0  
**Last Updated:** 2026-02-04  
**Domain:** r-man.work.gd  
**Image Tag:** rmanv1
