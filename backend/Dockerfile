# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Expose API port
EXPOSE 3030

# Start the backend
CMD ["node", "index.js"]
