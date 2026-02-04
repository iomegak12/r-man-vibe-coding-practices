# Database Seeder Dockerfile
# Node.js 22 Alpine-based image

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Set environment variable
ENV NODE_ENV=production

# Run seeder
CMD ["npm", "run", "seed"]
