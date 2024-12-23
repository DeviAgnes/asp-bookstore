# Use official Node.js image as a base
FROM oven/bun:latest
# Create and set working directory
WORKDIR /app
# Copy package.json and package-lock.json files
COPY package.json bun.lockb* ./
# Install dependencies
RUN bun install
# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000
# Start the application
CMD ["bun", "run", "start"]