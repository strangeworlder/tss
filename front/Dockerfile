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
EXPOSE 8080

# Command to run the application
CMD ["npm", "run", "dev"] 