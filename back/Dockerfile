FROM node:18-alpine

WORKDIR /app

# Create .npmrc file to increase network timeout
RUN echo "network-timeout=100000" > .npmrc

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application (use ts-node-dev directly instead of building)
CMD ["npm", "run", "dev"]

# Set Node.js version explicitly
ENV NODE_VERSION=18.19.0 