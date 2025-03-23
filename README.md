# TSS Project

Full-stack application with Vue.js frontend and Node.js backend using a hybrid database approach.

## Docker Setup

This project is fully containerized with Docker, making it easy to set up and run the entire stack with a single command.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tss
   ```

2. Start all services:
   ```bash
   docker-compose up
   ```

   Or run in detached mode:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:4000/api
   - GraphQL Playground: http://localhost:4000/graphql

### Services

The Docker setup includes the following services:

- **Frontend**: Vue.js application
- **Backend**: Node.js/Express.js API
- **MongoDB**: Document database for social content
- **PostgreSQL**: Relational database for user accounts and relationships
- **Redis**: Caching and session management

### Development Workflow

When developing, any changes to the front or back directories will be automatically reflected in the running containers thanks to volume mounting.

### Database Management

- MongoDB data is persisted in the `mongo_data` volume
- PostgreSQL data is persisted in the `postgres_data` volume
- Redis data is persisted in the `redis_data` volume

You can connect to the databases using the following credentials:

- **MongoDB**: mongodb://localhost:27017/tss
- **PostgreSQL**: 
  - Host: localhost
  - Port: 5432
  - User: postgres
  - Password: postgres
  - Database: tss
- **Redis**: redis://localhost:6379

### Stopping the Application

To stop all services:
```bash
docker-compose down
```

To stop all services and remove volumes (this will delete all data):
```bash
docker-compose down -v
```

## Architecture

### Database Strategy

The project uses a hybrid database approach:

1. **MongoDB**: Primary database for social content and blog posts
   - Strengths: Schema flexibility, horizontal scaling
   - Use cases: User-generated content, blogs, posts, comments

2. **PostgreSQL**: Relational data 
   - Strengths: ACID compliance, complex queries, transactions
   - Use cases: User accounts, authentication data, relationships

3. **Redis**: Caching and session management
   - Strengths: In-memory data store, extremely fast operations
   - Use cases: Session storage, caching, rate limiting, real-time features

### Frontend

- Vue.js with TypeScript
- Atomic design principles
- Global semantic variables for styling

### Backend

- Node.js with Express.js
- TypeScript
- GraphQL with Apollo Server
- RESTful endpoints
- JWT authentication
- Domain-driven design principles

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