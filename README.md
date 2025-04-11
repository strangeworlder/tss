# TSS Project

Full-stack application with Vue.js frontend and Node.js backend using a hybrid database approach.

## Project Structure

The project follows a modular architecture with clear separation of concerns:

```
tss/
├── front/            # Frontend Vue.js application
│   ├── src/
│   │   ├── api/     # API client and services
│   │   ├── assets/  # Static assets and global styles
│   │   ├── components/ # Reusable UI components
│   │   ├── composables/ # Vue composition functions
│   │   ├── router/  # Vue Router configuration
│   │   ├── stores/  # Pinia state management
│   │   ├── types/   # TypeScript type definitions
│   │   ├── utils/   # Utility functions
│   │   └── views/   # Route components
│   └── public/      # Static files
├── back/            # Backend Node.js/Express API
│   ├── src/
│   │   ├── api/    # API routes and controllers
│   │   ├── config/ # Configuration files
│   │   ├── models/ # Database models
│   │   ├── schemas/ # GraphQL schemas
│   │   ├── services/ # Business logic
│   │   └── utils/  # Utility functions
│   └── public/     # Static files
├── utils/          # Shared utility functions
├── middleware/     # Custom middleware
├── models/        # Shared database models
└── schemas/       # Shared GraphQL schemas
```

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
   - MongoDB: mongodb://localhost:27017
   - PostgreSQL: postgresql://postgres:postgres@localhost:5432/tss
   - Redis: redis://localhost:6379

### Services

The Docker setup includes the following services with health checks:

- **Frontend**: Vue.js application (Vite)
  - Development mode with hot reloading
  - Mounted volumes for live code updates
  - Environment variables for API configuration

- **Backend**: Node.js/Express.js API
  - Development mode with hot reloading
  - Mounted volumes for live code updates
  - Environment variables for database connections

- **MongoDB**: Document database for social content
  - Version 6.0
  - Health checks for service availability
  - Persistent volume for data storage

- **PostgreSQL**: Relational database for user accounts and relationships
  - Version 15
  - Health checks for service availability
  - Persistent volume for data storage

- **Redis**: Caching and session management
  - Version 7.0 (Alpine)
  - Health checks for service availability
  - Persistent volume for data storage

### Development Workflow

When developing with Docker:
- All services are automatically started in the correct order
- Frontend and backend code changes are automatically reflected thanks to volume mounting
- Database services wait for health checks before the backend starts
- Services automatically restart unless explicitly stopped

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

- Vue 3 with Composition API and TypeScript
- Vite 6.x as build tool
- Atomic design principles with the following structure:
  - `components/` - Reusable UI components
  - `composables/` - Vue composition functions
  - `views/` - Route components
  - `stores/` - Pinia state management
  - `router/` - Vue Router configuration
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
  - `api/` - API client and services
  - `assets/` - Static assets and global styles
- Global semantic variables for styling in `assets/vars.css`
- BEM syntax for CSS classes
- Vue DevTools integration

### Backend

- Node.js with Express.js
- TypeScript
- GraphQL with Apollo Server
- RESTful endpoints
- JWT authentication
- Domain-driven design principles

## Local Development Setup

If you prefer to develop without Docker, you can set up the project locally:

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

4. Open your browser and visit http://localhost:5173 (Vite's default port)

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

- **Blog System**:
  - Blog post listing with pagination and filtering
  - Individual blog post pages with Markdown rendering
  - Admin interface for post management
  - Responsive image handling

- **User Features**:
  - Authentication with JWT
  - User profiles
  - Newsletter signup
  - Real-time notifications

- **Development Tools**:
  - TypeScript for type safety
  - ESLint and Prettier for code formatting
  - Jest for unit testing
  - Cypress for E2E testing
  - Docker for containerization

## Technologies Used

### Frontend
- Vue 3 with Composition API
- TypeScript 5.8
- Vite 6.x as build tool
- CSS custom properties (variables in front/src/assets/vars.css)
- BEM syntax for CSS classes
- Vue Router 4.x for routing
- Pinia 3.x for state management
- Marked for Markdown parsing
- Jest for unit testing
- Cypress 14.x for E2E testing
- ESLint 9.x and Prettier for code formatting
- Vue DevTools for debugging

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