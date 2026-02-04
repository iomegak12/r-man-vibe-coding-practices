# ATHS - Authentication Service Dockerfile
# Node.js 22 Alpine-based image

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads/profiles

# Expose port
EXPOSE 5001

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
