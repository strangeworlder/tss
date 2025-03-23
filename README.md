# Vue Blog

A modern blog application built with Vue 3 and TypeScript.

## Project Structure

The project follows a modular architecture:

- `front/` - Frontend Vue.js application
- `back/` - Backend Node.js/Express API with GraphQL
- `utils/` - Shared utility functions
- `middleware/` - Custom middleware for the backend
- `models/` - Database models
- `schemas/` - GraphQL schemas

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn
- Run `nvm use` in the terminal to ensure the correct Node.js version
- WSL2 with fish shell for development

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd front
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and visit http://localhost:5173

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd back
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. The API will be available at http://localhost:[PORT]/api (check your environment variables for the specific port)

## Features

- Responsive blog layout using BEM CSS methodology
- Blog post listing
- Individual blog post pages with Markdown rendering
- Newsletter signup form
- TypeScript for type safety
- CSS custom properties (variables) for styling
- Image API with resizing and format conversion
- Real-time features using WebSockets (notifications, chat)

## Technologies Used

### Frontend
- Vue 3 with Composition API
- TypeScript
- CSS custom properties (variables in front/src/assets/vars.css)
- BEM syntax for CSS classes
- Vue Router for routing
- Pinia for state management
- Marked for Markdown parsing

### Backend
- Node.js with Express.js
- TypeScript
- Apollo Server for GraphQL API
- MongoDB for social content storage
- PostgreSQL for relational data (user accounts, relationships)
- JWT for authentication
- Redis for caching and session management
- WebSockets for real-time features
- Sharp for image processing
- Domain-driven design principles
- Layered architecture (controllers, services, repositories)

## API Reference

### GraphQL API

The GraphQL API is available at `/api/graphql`. It provides the following functionality:

#### Image Queries
- `images`: Fetches all available images
- `image(id: ID!)`: Fetches an image by ID
- `imageByFilename(filename: String!)`: Fetches an image by filename
- `getImageUrl(filename: String!, size: ImageSize, format: ImageFormat, quality: Int)`: Generates a URL for an image with the specified processing options

#### Image Mutations
- `updateImageMetadata(id: ID!, altText: String)`: Updates metadata for an image

### REST API

#### Image Endpoints
- `GET /api/images/:filename`: Fetches and processes an image
  - Query parameters:
    - `size`: Resizes the image (`thumbnail`, `medium`, `full`)
    - `format`: Converts the image format (`webp`, `jpeg`, `png`)
    - `quality`: Adjusts image quality (1-100)
    - `crop`: Specifies crop area

## Development

### Linting and Formatting
- Frontend: `cd front && npm run lint`
- Backend: `cd back && npm run lint`

### Testing
- Frontend unit tests: `cd front && npm run test:unit`
- Frontend E2E tests: `cd front && npm run test:e2e`
- Backend tests: `cd back && npm run test`

## License

MIT 