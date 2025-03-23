# TSS Project Backend

This is the backend service for the TSS Project, providing REST and GraphQL APIs for blog content, user management, and image processing.

## Architecture

The backend follows domain-driven design principles with a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Repositories**: Abstract data access
- **Models**: Define data structures
- **Schemas**: Define GraphQL schemas

Code is organized into modules by feature/domain in the `domains/` directory.

## Technologies

- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **API**: 
  - GraphQL via Apollo Server
  - RESTful endpoints
  - JWT for authentication
  - Rate limiting for all endpoints
  - WebSockets for real-time features (notifications, chat)
- **Databases**:
  - MongoDB: Primary database for social content
  - PostgreSQL: Relational data (user accounts, relationships)
  - Redis: Caching and session management
- **Storage**: AWS S3 for media storage
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest for unit and integration tests
- **Code Quality**: ESLint and Prettier

## Setup

### Docker (Recommended)

The easiest way to run the backend is using Docker:

```bash
# From the project root
docker-compose up backend
```

The API will be available at http://localhost:4000/api
The GraphQL playground will be available at http://localhost:4000/graphql

### Local Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. The API will be available at http://localhost:[PORT]/api (check your environment variables for the specific port)

## Database Migrations

The project uses database migrations to manage schema changes:

- MongoDB migrations are located in `migrations/mongodb/`
- PostgreSQL migrations are located in `migrations/postgresql/`

Run migrations with:

```