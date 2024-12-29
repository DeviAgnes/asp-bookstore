# Base image
FROM node:16-alpine

# Install bash and curl
RUN apk add --no-cache bash curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Copy application files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
