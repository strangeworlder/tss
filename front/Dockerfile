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

# Copy the frontend source code
COPY front/src ./front/src
COPY front/public ./front/public
COPY front/index.html ./front/
COPY front/vite.config.ts ./front/
COPY front/tsconfig.json ./front/
COPY front/tsconfig.app.json ./front/
COPY front/tsconfig.node.json ./front/
COPY front/env.d.ts ./front/
COPY front/jest.config.js ./front/
COPY front/jest.setup.js ./front/
COPY front/tsconfig.jest.json ./front/
COPY front/cypress.config.ts ./front/

# Create symlink for shared types in frontend node_modules
RUN mkdir -p ./front/node_modules/@shared
RUN ln -sf /app/shared ./front/node_modules/@shared/types

# Set working directory to the frontend folder
WORKDIR /app/front

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "run", "dev"] 