# =====================================================
# Traefik with Certificate Download Support
# =====================================================

FROM traefik:v2.11

# Install wget and unzip for certificate download
RUN apk add --no-cache wget unzip

# Copy configuration files
COPY traefik.yml /etc/traefik/traefik.yml
COPY dynamic/ /etc/traefik/dynamic/

# Copy and make entrypoint executable
COPY download-certs.sh /usr/local/bin/download-certs.sh
RUN chmod +x /usr/local/bin/download-certs.sh

# Create certificates directory
RUN mkdir -p /etc/traefik/certs

# Use custom entrypoint
ENTRYPOINT ["/usr/local/bin/download-certs.sh"]
