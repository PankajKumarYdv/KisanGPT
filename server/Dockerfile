# Dockerfile for KisanGPT Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code and other files
COPY src/ ./src/
COPY tests/ ./tests/

# Expose backend port
EXPOSE 5000

# Set environment variables defaults
ENV PORT=5000
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
