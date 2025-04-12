# Dockerfile
FROM node:18-alpine

# The /Notes directory should act as the main application directory
WORKDIR /Notes

# Copy the app package and package-lock.json file
COPY package*.json ./

# Install node packages
RUN npm install

# Copy local directories
COPY ./Backend ./Backend
COPY ./Frontend ./Frontend

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "Backend/server.js"]