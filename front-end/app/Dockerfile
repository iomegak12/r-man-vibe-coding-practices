# Multi-stage Dockerfile for React Web App
# Stage 1: Build the React application
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build arguments for API URLs
ARG REACT_APP_ATHS_URL=http://localhost:5001
ARG REACT_APP_CRMS_URL=http://localhost:5002
ARG REACT_APP_ORMS_URL=http://localhost:5003
ARG REACT_APP_CMPS_URL=http://localhost:5004
ARG REACT_APP_ENV=production

# Set environment variables for build
ENV REACT_APP_ATHS_URL=$REACT_APP_ATHS_URL
ENV REACT_APP_CRMS_URL=$REACT_APP_CRMS_URL
ENV REACT_APP_ORMS_URL=$REACT_APP_ORMS_URL
ENV REACT_APP_CMPS_URL=$REACT_APP_CMPS_URL
ENV REACT_APP_ENV=$REACT_APP_ENV

# Build the React app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
