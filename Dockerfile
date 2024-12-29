# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN curl -fsSL https://bun.sh/install | bash
RUN bun install --ignore-scripts

# Copy application files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
