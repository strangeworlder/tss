FROM node:18-alpine

WORKDIR /app

# Create .npmrc file to increase network timeout
RUN echo "network-timeout=100000" > .npmrc

# Copy root package.json and package-lock.json
COPY package.json package-lock.json ./

# Create workspace directories
RUN mkdir -p back front shared

# Copy workspace package.json files
COPY back/package.json ./back/
COPY front/package.json ./front/
COPY shared/package.json ./shared/

# Install dependencies
RUN npm install

# Copy the shared types
COPY shared ./shared

# Copy the backend source code
COPY back/src ./back/src
COPY back/tsconfig.json ./back/

# Create node_modules symlink for path resolution to work with @shared
RUN mkdir -p ./back/node_modules
RUN ln -sf /app/shared ./back/node_modules/@shared

# Set working directory to the backend folder
WORKDIR /app/back

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "dev"]

# Set Node.js version explicitly
ENV NODE_VERSION=18.19.0 