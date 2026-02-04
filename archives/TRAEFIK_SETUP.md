# Traefik Reverse Proxy Setup Guide

## 🎯 Overview

This guide explains the Traefik reverse proxy integration for the R-MAN E-Commerce microservices platform. Traefik provides SSL termination, automatic HTTPS, service discovery, and centralized routing.

## 📋 What is Traefik?

Traefik is a modern HTTP reverse proxy and load balancer that makes deploying microservices easy. Key features:

- **Automatic Service Discovery**: Uses Docker labels to configure routes dynamically
- **SSL/TLS Termination**: Handles HTTPS encryption at the edge
- **HTTP to HTTPS Redirect**: Automatically upgrades insecure connections
- **Dashboard**: Real-time monitoring of routes and services
- **Load Balancing**: Distributes traffic across service instances
- **Zero Downtime Deployments**: Updates routes without restart

## 🏗️ Architecture

```
Internet/Browser
      ↓
[Traefik Reverse Proxy]
  Port 80 (HTTP) → Auto-redirect to 443
  Port 443 (HTTPS) → SSL Termination
  Port 8080 (Dashboard)
      ↓
[Service Discovery via Docker Labels]
      ↓
┌─────────────────────────────────────┐
│  Backend Services (HTTP Internal)   │
│  - Web App (3000)                   │
│  - ATHS (5001)                      │
│  - CRMS (5002)                      │
│  - ORMS (5003)                      │
│  - CMPS (5004)                      │
│  - Mongo Express (8081)             │
└─────────────────────────────────────┘
```

## 🔧 Configuration Files

### 1. Static Configuration (`traefik.yml`)

Located in: `deployment/traefik/traefik.yml`

```yaml
# API and Dashboard
api:
  dashboard: true
  insecure: true  # Dashboard on port 8080

# Entry Points
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  
  websecure:
    address: ":443"

# Providers
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: r-man-network
  
  file:
    directory: "/etc/traefik/dynamic"
    watch: true
```

**Key Points:**
- `exposedByDefault: false` - Only services with `traefik.enable=true` are exposed
- `network: r-man-network` - Must match Docker Compose network
- File provider watches `dynamic/` directory for certificate config

### 2. Dynamic Configuration (`dynamic/certificates.yml`)

Located in: `deployment/traefik/dynamic/certificates.yml`

```yaml
tls:
  certificates:
    - certFile: /etc/traefik/certs/fullchain.pem
      keyFile: /etc/traefik/certs/privkey.pem
  
  options:
    default:
      minVersion: VersionTLS12
      sniStrict: true
```

**Key Points:**
- Certificates stored in `/etc/traefik/certs/`
- TLS 1.2 minimum for security
- SNI strict mode prevents hostname mismatches

### 3. Certificate Download Script (`download-certs.sh`)

Located in: `deployment/traefik/download-certs.sh`

Downloads SSL certificates from GitHub at container startup:

```bash
#!/bin/sh
CERT_URL="https://github.com/iomegak12/app-deployment-artifacts/raw/refs/heads/main/r-man-work-gd-certificates.zip"
CERT_DIR="/etc/traefik/certs"

# Download, extract, and verify certificates
wget -q -O /tmp/certificates.zip "${CERT_URL}"
unzip -q -o /tmp/certificates.zip -d /tmp/certs
cp -f /tmp/certs/*.pem "${CERT_DIR}/"

# Verify required files exist
if [ ! -f "${CERT_DIR}/fullchain.pem" ] || [ ! -f "${CERT_DIR}/privkey.pem" ]; then
    echo "❌ Required certificate files not found!"
    exit 1
fi

# Start Traefik
exec traefik
```

## 🏷️ Service Routing with Docker Labels

Each service in `docker-compose.yml` has Traefik labels for routing configuration.

### Example: ATHS Service Labels

```yaml
labels:
  # Enable Traefik for this service
  - "traefik.enable=true"
  
  # HTTPS Router (main)
  - "traefik.http.routers.aths.rule=Host(`auth.localhost`) || PathPrefix(`/api/auth`)"
  - "traefik.http.routers.aths.entrypoints=web,websecure"
  - "traefik.http.routers.aths.tls=true"
  - "traefik.http.services.aths.loadbalancer.server.port=5001"
  
  # HTTP Router (redirects to HTTPS)
  - "traefik.http.routers.aths-insecure.rule=Host(`auth.localhost`) || PathPrefix(`/api/auth`)"
  - "traefik.http.routers.aths-insecure.entrypoints=web"
  - "traefik.http.middlewares.aths-redirect.redirectscheme.scheme=https"
  - "traefik.http.routers.aths-insecure.middlewares=aths-redirect"
```

### Label Breakdown

| Label | Purpose |
|-------|---------|
| `traefik.enable=true` | Activate Traefik routing for this service |
| `traefik.http.routers.{name}.rule` | Routing rule (host or path) |
| `traefik.http.routers.{name}.entrypoints` | Which ports to listen on (web=80, websecure=443) |
| `traefik.http.routers.{name}.tls=true` | Enable TLS/SSL for this route |
| `traefik.http.services.{name}.loadbalancer.server.port` | Backend service port |
| `traefik.http.middlewares.{name}.redirectscheme.scheme` | Create redirect middleware |
| `traefik.http.routers.{name}.middlewares` | Apply middleware to route |

## 🌐 Routing Rules

### All Service Routes

| Service | Host-based URL | Path-based URL | Backend Port |
|---------|---------------|----------------|--------------|
| **Web App** | https://rman.localhost | https://localhost/ | 3000 |
| **ATHS** | https://auth.localhost | https://localhost/api/auth | 5001 |
| **CRMS** | https://customers.localhost | https://localhost/api/customers | 5002 |
| **ORMS** | https://orders.localhost | https://localhost/api/orders | 5003 |
| **CMPS** | https://complaints.localhost | https://localhost/api/complaints | 5004 |
| **Mongo Express** | https://db.localhost | N/A | 8081 |
| **Traefik Dashboard** | http://traefik.localhost | http://localhost:8080 | 8080 |

### Routing Strategies

**1. Host-based Routing** (Subdomain style)
- URL: `https://auth.localhost`
- Rule: `Host(\`auth.localhost\`)`
- Best for: Public-facing services with dedicated subdomains

**2. Path-based Routing** (API Gateway style)
- URL: `https://localhost/api/auth`
- Rule: `PathPrefix(\`/api/auth\`)`
- Best for: Internal APIs, single domain deployments

**3. Combined Routing** (Flexible)
- Rule: `Host(\`auth.localhost\`) || PathPrefix(\`/api/auth\`)`
- Both styles work simultaneously

## 🔒 SSL/TLS Configuration

### Certificate Flow

1. **Container Startup**
   - Traefik container starts
   - Runs `download-certs.sh` script
   - Downloads certificates from GitHub
   - Extracts to `/etc/traefik/certs/`
   - Verifies `fullchain.pem` and `privkey.pem` exist

2. **Certificate Loading**
   - Traefik reads `dynamic/certificates.yml`
   - Loads certificates from `/etc/traefik/certs/`
   - Applies TLS configuration

3. **HTTPS Serving**
   - Clients connect via HTTPS (port 443)
   - Traefik terminates SSL
   - Forwards HTTP requests to backend services
   - Backend services don't need SSL config

### TLS Settings

```yaml
minVersion: VersionTLS12  # TLS 1.2 minimum (no TLS 1.0/1.1)
sniStrict: true           # Strict SNI checking
```

### Testing SSL

```bash
# Test HTTPS connection
curl -k https://localhost

# Test HTTP to HTTPS redirect
curl -I http://localhost
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://localhost/

# Test service-specific HTTPS
curl -k https://auth.localhost/api/health
curl -k https://customers.localhost/api/health
curl -k https://orders.localhost/api/health
curl -k https://complaints.localhost/api/health
```

Note: `-k` flag bypasses SSL verification for self-signed certificates

## 📊 Traefik Dashboard

Access the dashboard at: **http://localhost:8080** or **http://traefik.localhost**

### Dashboard Features

1. **HTTP Section**
   - View all HTTP routers
   - See routing rules for each service
   - Check middleware configuration
   - Monitor request counts

2. **Services Section**
   - View all backend services
   - Check server status (UP/DOWN)
   - See load balancer configuration

3. **Middleware Section**
   - View all middleware (redirects, auth, etc.)
   - Check which routers use each middleware

4. **Features**
   - View TLS certificate information
   - Monitor entrypoints (ports 80, 443)

### Dashboard Screenshots Guide

Navigate to different sections to inspect:
- **Routers**: Click on a router name to see its configuration
- **Services**: Click on a service to see backend servers
- **Middlewares**: Click on middleware to see where it's used

## 🚀 Deployment Steps

### 1. Verify Configuration

```bash
cd deployment

# Check Traefik folder exists
ls -la traefik/

# Verify traefik.yml has r-man-network configured
grep "network:" traefik/traefik.yml
```

### 2. Build and Start

```bash
# Build all services including Traefik
docker-compose up -d --build

# Verify Traefik started successfully
docker-compose logs traefik
```

Expected output:
```
🔐 Starting SSL certificate download...
📥 Downloading certificates from GitHub...
✅ Certificates downloaded successfully
📦 Extracting certificates...
🔒 Certificate permissions set
✅ SSL certificates ready!
🚀 Starting Traefik...
```

### 3. Verify Services

```bash
# Check all services are running
docker-compose ps

# Should show all services with status "Up"
# Including rman-traefik on ports 80, 443, 8080
```

### 4. Test Routes

```bash
# Test HTTP to HTTPS redirect
curl -I http://localhost
# Expected: 301 redirect to https://localhost

# Test HTTPS (with self-signed cert)
curl -k https://localhost

# Test service endpoints
curl -k https://auth.localhost/api/health
curl -k https://customers.localhost/api/health
curl -k https://orders.localhost/api/health
curl -k https://complaints.localhost/api/health
```

### 5. Access Dashboard

Open browser and navigate to:
- http://localhost:8080
- http://traefik.localhost

Verify all routers show "UP" status

## 🔧 Troubleshooting

### Issue: Certificates Not Downloaded

**Symptom:**
```
❌ Required certificate files not found!
```

**Solution:**
```bash
# Check internet connectivity
ping github.com

# Manually download certificates
docker exec -it rman-traefik sh
wget https://github.com/iomegak12/app-deployment-artifacts/raw/refs/heads/main/r-man-work-gd-certificates.zip -O /tmp/test.zip
unzip -l /tmp/test.zip

# Restart Traefik
docker-compose restart traefik
```

### Issue: Service Not Routing

**Symptom:**
404 Not Found when accessing service URL

**Solution:**
```bash
# Check service has Traefik enabled
docker inspect rman-aths | grep "traefik.enable"

# Check Traefik discovered the service
docker exec rman-traefik wget -O- http://localhost:8080/api/http/routers

# Verify service is running
docker-compose ps aths

# Check Traefik logs
docker-compose logs traefik | grep -i aths
```

### Issue: HTTPS Not Working

**Symptom:**
SSL certificate errors or connection refused

**Solution:**
```bash
# Verify certificates exist
docker exec rman-traefik ls -la /etc/traefik/certs/

# Check certificate validity
docker exec rman-traefik cat /etc/traefik/certs/fullchain.pem

# Verify port 443 is exposed
docker-compose ps traefik
# Should show 0.0.0.0:443->443/tcp

# Check for port conflicts
netstat -ano | findstr :443  # Windows
lsof -i :443                 # Linux/Mac
```

### Issue: Dashboard Not Accessible

**Symptom:**
Cannot access http://localhost:8080

**Solution:**
```bash
# Verify port 8080 exposed
docker-compose ps traefik

# Check dashboard is enabled
docker exec rman-traefik cat /etc/traefik/traefik.yml | grep -A2 "api:"

# Check for port conflicts
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Access via container IP
docker inspect rman-traefik | grep IPAddress
curl http://<container-ip>:8080
```

### Issue: HTTP Redirect Loop

**Symptom:**
Browser shows "Too many redirects"

**Solution:**
```bash
# Check redirect middleware configuration
docker exec rman-traefik cat /etc/traefik/traefik.yml

# Verify entrypoints are correct
# web (80) should redirect to websecure (443)
# websecure (443) should NOT redirect

# Check service labels
docker inspect rman-web | grep -i redirect
```

## 📝 Advanced Configuration

### Adding New Services

To add a new service with Traefik routing:

1. **Add service to docker-compose.yml**
```yaml
new-service:
  image: myservice:latest
  networks:
    - r-man-network
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.newservice.rule=Host(`newservice.localhost`)"
    - "traefik.http.routers.newservice.entrypoints=web,websecure"
    - "traefik.http.routers.newservice.tls=true"
    - "traefik.http.services.newservice.loadbalancer.server.port=8000"
```

2. **Restart Traefik to discover new service**
```bash
docker-compose restart traefik
```

3. **Verify route in dashboard**
- Visit http://localhost:8080
- Check HTTP > Routers > newservice

### Custom Domain Names

To use custom domains instead of `.localhost`:

1. **Update /etc/hosts** (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows)
```
127.0.0.1 rman.local
127.0.0.1 auth.rman.local
127.0.0.1 api.rman.local
```

2. **Update Traefik labels**
```yaml
- "traefik.http.routers.aths.rule=Host(`auth.rman.local`)"
```

3. **Access via custom domain**
```
https://auth.rman.local
```

### Load Balancing Multiple Instances

Scale services and Traefik automatically load balances:

```bash
# Scale ATHS to 3 instances
docker-compose up -d --scale aths=3

# Traefik automatically discovers all instances
# Requests distributed round-robin
```

### Adding Middleware

Add custom middleware for authentication, rate limiting, etc:

1. **Define middleware in labels**
```yaml
labels:
  - "traefik.http.middlewares.auth-basic.basicauth.users=admin:$$apr1$$..."
  - "traefik.http.routers.aths.middlewares=auth-basic"
```

2. **Common middleware types:**
- `basicauth`: HTTP Basic Authentication
- `ratelimit`: Rate limiting
- `compress`: Response compression
- `headers`: Custom headers
- `stripprefix`: Remove path prefix
- `retry`: Retry failed requests

## 🔐 Security Best Practices

### 1. Secure Dashboard
```yaml
# Production: Disable insecure dashboard
api:
  dashboard: true
  insecure: false  # Changed from true

# Add authentication
labels:
  - "traefik.http.routers.dashboard.middlewares=auth"
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$..."
```

### 2. Production Certificates

For production, use Let's Encrypt instead of self-signed:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /etc/traefik/acme.json
      httpChallenge:
        entryPoint: web
```

### 3. Security Headers

Add security headers middleware:

```yaml
labels:
  - "traefik.http.middlewares.security.headers.stsSeconds=31536000"
  - "traefik.http.middlewares.security.headers.stsIncludeSubdomains=true"
  - "traefik.http.middlewares.security.headers.stsPreload=true"
  - "traefik.http.routers.web.middlewares=security"
```

## 📚 Additional Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Provider](https://doc.traefik.io/traefik/providers/docker/)
- [Routing Configuration](https://doc.traefik.io/traefik/routing/overview/)
- [TLS Configuration](https://doc.traefik.io/traefik/https/tls/)
- [Middlewares](https://doc.traefik.io/traefik/middlewares/overview/)

## 📄 Summary

Traefik integration provides:
- ✅ Automatic HTTPS with SSL termination
- ✅ HTTP to HTTPS redirection
- ✅ Dynamic service discovery
- ✅ Centralized routing configuration
- ✅ Load balancing across instances
- ✅ Real-time monitoring dashboard
- ✅ Zero-downtime deployments

All services are now accessible via clean, secure HTTPS URLs with automatic SSL certificate management.
