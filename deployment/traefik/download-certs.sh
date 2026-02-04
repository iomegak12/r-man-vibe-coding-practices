#!/bin/sh

# =====================================================
# Certificate Download Script for Traefik
# Downloads SSL certificates from GitHub at startup
# =====================================================

set -e

CERT_URL="https://github.com/iomegak12/app-deployment-artifacts/raw/refs/heads/main/r-man-work-gd-certificates.zip"
CERT_DIR="/etc/traefik/certs"
TEMP_DIR="/tmp/certs"

echo "🔐 Starting SSL certificate download..."

# Create directories
mkdir -p "${CERT_DIR}"
mkdir -p "${TEMP_DIR}"

# Download certificates
echo "📥 Downloading certificates from GitHub..."
wget -q -O "${TEMP_DIR}/certificates.zip" "${CERT_URL}"

if [ ! -f "${TEMP_DIR}/certificates.zip" ]; then
    echo "❌ Failed to download certificates"
    exit 1
fi

echo "✅ Certificates downloaded successfully"

# Extract certificates
echo "📦 Extracting certificates..."
unzip -q -o "${TEMP_DIR}/certificates.zip" -d "${TEMP_DIR}"

# Move certificates to final location
echo "📂 Moving certificates to ${CERT_DIR}..."
cp -f "${TEMP_DIR}"/*.pem "${CERT_DIR}/" 2>/dev/null || true

# Verify required certificates exist
if [ ! -f "${CERT_DIR}/fullchain.pem" ] || [ ! -f "${CERT_DIR}/privkey.pem" ]; then
    echo "❌ Required certificate files not found!"
    echo "   Expected: fullchain.pem, privkey.pem"
    ls -la "${CERT_DIR}"
    exit 1
fi

# Set proper permissions
chmod 644 "${CERT_DIR}"/*.pem
echo "🔒 Certificate permissions set"

# Cleanup
rm -rf "${TEMP_DIR}"
echo "🧹 Cleanup completed"

echo "✅ SSL certificates ready!"
echo ""
ls -lh "${CERT_DIR}"
echo ""

# Start Traefik
echo "🚀 Starting Traefik..."
exec traefik
