# Use the desired Node.js version (e.g., 18 or 20)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first
COPY package*.json ./

# Clean npm cache and install production dependencies
RUN npm cache clean --force && npm install --production

# Install rimraf directly if not in package.json
RUN npm install rimraf --save-dev

# Build the app
RUN npm run build

# Copy the rest of the app files
COPY . .

# Expose the port (if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
