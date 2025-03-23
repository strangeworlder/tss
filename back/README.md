# Vue Blog Backend

This is the backend service for the Vue Blog application, providing REST and GraphQL APIs for blog content, user management, and image processing.

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
npm run migrations:up
```

## API Reference

### GraphQL API

The GraphQL API is available at `/api/graphql`. It provides a flexible way to query and mutate data.

#### Image API

The image API provides ways to retrieve image metadata and generate URLs for image processing.

##### Queries

- `images`: Fetches all available images
  ```graphql
  query {
    images {
      id
      filename
      width
      height
      url
      altText
    }
  }
  ```

- `image(id: ID!)`: Fetches an image by ID
  ```graphql
  query {
    image(id: "1") {
      id
      filename
      width
      height
      url
      altText
    }
  }
  ```

- `imageByFilename(filename: String!)`: Fetches an image by filename
  ```graphql
  query {
    imageByFilename(filename: "example-image.jpg") {
      id
      filename
      width
      height
      url
      altText
    }
  }
  ```

- `getImageUrl(filename: String!, size: ImageSize, format: ImageFormat, quality: Int)`: Generates a URL for an image with processing options
  ```graphql
  query {
    getImageUrl(
      filename: "example-image.jpg", 
      size: MEDIUM, 
      format: WEBP, 
      quality: 85
    ) {
      url
      size
      format
    }
  }
  ```

##### Mutations

- `updateImageMetadata(id: ID!, altText: String)`: Updates image metadata
  ```graphql
  mutation {
    updateImageMetadata(
      id: "1", 
      altText: "Updated image description"
    ) {
      id
      filename
      altText
      updatedAt
    }
  }
  ```

### REST API

#### Image Endpoints

- `GET /api/images/:filename`: Fetches and processes an image
  - Query parameters:
    - `size`: Resizes the image (`thumbnail`, `medium`, `full`)
    - `format`: Converts the image format (`webp`, `jpeg`, `png`)
    - `quality`: Adjusts image quality (1-100)
    - `crop`: Specifies crop area
  
  Example:
  ```
  GET /api/images/example-image.jpg?size=medium&format=webp&quality=85
  ```

## Image Processing Details

The image API uses Sharp for image processing, offering the following capabilities:

- **Resizing**: Convert images to different sizes
  - `thumbnail`: 150x150px
  - `medium`: 400x300px
  - `full`: Original size

- **Format Conversion**: Convert images to different formats
  - `webp`: Modern format with better compression
  - `jpeg`: Standard format for photos
  - `png`: Format with alpha channel support
  - `original`: Keep the original format

- **Quality Adjustment**: Compress images with quality settings (1-100)

- **Caching**: Images are cached with appropriate headers for optimal performance

## Development

### Dependencies

- Express.js: Web framework
- Apollo Server: GraphQL server
- Sharp: Image processing library
- GraphQL: API query language

### Environment Variables

Key environment variables:
- `PORT`: Server port
- `NODE_ENV`: Environment mode
- `API_PREFIX`: Prefix for API routes 