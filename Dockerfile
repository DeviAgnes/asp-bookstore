# Use the base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first
COPY package*.json ./

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Copy the rest of the app files
COPY . .

# Expose the port (if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
