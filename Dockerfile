# # Use the desired Node.js version (e.g., 20)
# FROM node:20

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json (or yarn.lock) first
# COPY package*.json ./

# # Clean npm cache and install all dependencies (including dev dependencies)
# RUN npm cache clean --force && npm install --production

# # Install rimraf and @remix-run/dev if they are not already in package.json
# RUN npm install rimraf @remix-run/dev --save-dev

# # Build the app
# RUN npm run build

# # Copy the rest of the app files
# COPY . .

# # Expose the port (if needed)
# EXPOSE 3000

# # Start the app
# CMD ["npm", "start"]


# Use official Node.js image as a base
FROM oven/bun:latest
# Create and set working directory
WORKDIR /app
# Copy package.json and package-lock.json files
COPY package.json bun.lockb* ./
# Install dependencies
RUN bun install

# Set environment variables for database connection
ENV DATABASE_URL="postgresql://DeviAgnes:DeviAgnes123@bookstore-db.cz2s0qqkaqj4.us-east-1.rds.amazonaws.com:5432/postgres"

# Copy Prisma schema and .env file
COPY prisma ./prisma
COPY .env .env


# Copy the rest of the application
COPY . .

# Install Prisma and generate the Prisma client (this step is important)
RUN bunx prisma generate



# Run Prisma Migrations using Bun
# RUN bunx prisma migrate deploy

# RUN bunx prisma db seed


# Expose port
EXPOSE 3000
# Start the application
CMD ["bun", "run", "dev"]