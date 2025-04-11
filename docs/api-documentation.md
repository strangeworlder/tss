# API Documentation

## Overview

This document outlines the API architecture, endpoints, and implementation patterns for our application. It serves as the authoritative reference for both frontend and backend developers to ensure consistency in API usage.

## API Architecture

Our application uses a RESTful API architecture with the following characteristics:

- **Base URL**: `/api`
- **Authentication**: JWT-based authentication with admin middleware
- **Response Format**: JSON
- **Error Handling**: Standardized error responses with appropriate HTTP status codes

## Endpoints

### Configuration API

Base path: `/api/configuration`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/global-delay` | GET | Get global delay settings | None | `{ globalDelay: number, minDelay: number, maxDelay: number, lastUpdated: Date, updatedBy: string }` |
| `/global-delay` | PUT | Update global delay settings | `{ delayHours: number }` | Updated settings object |
| `/content-override/:contentId` | GET | Get content-specific delay override | None | `{ contentId: string, delay: number, reason: string, expiresAt?: Date, createdAt: Date, createdBy: string }` |
| `/content-override/:contentId` | POST | Create content-specific delay override | `{ delayHours: number, reason: string }` | Created override object |
| `/content-override/:contentId` | DELETE | Remove content-specific delay override | None | No content (204) |

### Health API

Base path: `/api/health`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/` | GET | Basic health check | None | Health status with overall system health |
| `/detailed` | GET | Detailed health check | None | Detailed health information for all subsystems |
| `/service/:service` | GET | Service-specific health check | None | Health status for a specific service |

### Blog API

Base path: `/api/v1/blog`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/` | GET | Get all published blog posts | None | Array of blog posts |
| `/admin/all` | GET | Get all blog posts (including unpublished) | None | Array of all blog posts |
| `/` | POST | Create a new blog post | Blog post data (multipart/form-data with `heroImage` file upload) | Created blog post |
| `/tag/:tag` | GET | Get blog posts by tag | None | Array of blog posts with specified tag |
| `/id/:id` | GET | Get a specific blog post by ID | None | Blog post object |
| `/id/:id` | PUT | Update a blog post | Updated blog post data (multipart/form-data with optional `heroImage`) | Updated blog post |
| `/:slug` | GET | Get a specific blog post by slug | None | Blog post object |
| `/id/:id` | DELETE | Delete a blog post | None | Success message |

### Comments API

Base path: `/api/v1/blog` (nested within Blog API)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/posts/comments` | POST | Create a new comment | Comment data | Created comment |
| `/comments` | POST | Create a new comment reply | Comment data with parent comment ID | Created comment reply |
| `/posts/:postId/comments` | GET | Get comments for a specific post | None | Array of comments |
| `/comments/:commentId/replies` | GET | Get replies for a specific comment | None | Array of comment replies |
| `/comments/:commentId/status` | PATCH | Update comment status | `{ status: string }` | Updated comment |
| `/comments/:commentId` | DELETE | Delete a comment | None | Success message |

### Scheduled Content API

Base path: `/api/v1/scheduled-content`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/` | GET | Get all scheduled content for the authenticated user | None | Array of scheduled content items |
| `/:contentId` | GET | Get scheduled content by ID | None | Scheduled content object |
| `/:contentId/cancel` | POST | Cancel scheduled content | None | Updated scheduled content object |
| `/:contentId/retry` | POST | Retry failed publication | None | Updated scheduled content object |

## Data Models

### Blog Post

```typescript
interface IBlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  heroImage?: string;
  author: {
    name: string;
    type: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
  tags: string[];
}
```

### Comment

```typescript
interface IComment {
  id: string;
  postId: string;
  parentId?: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

### Configuration Settings

```typescript
interface IDelaySettings {
  globalDelay: number; // in hours
  minDelay: number; // in hours
  maxDelay: number; // in hours
  lastUpdated: Date;
  updatedBy: string;
}

interface IContentDelayOverride {
  contentId: string;
  delay: number; // in hours
  reason: string;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}
```

### Health Status

```typescript
interface IHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  timestamp: Date;
  version: string;
}

interface IDetailedHealthStatus extends IHealthStatus {
  services: {
    [key: string]: {
      status: 'healthy' | 'unhealthy' | 'degraded';
      message?: string;
      metrics?: Record<string, any>;
    }
  }
}
```

### Scheduled Content

```typescript
interface IScheduledContent {
  id: string;
  contentId: string;
  publishAt: string;
  status: ScheduledContentStatusEnum;
  error?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

enum ScheduledContentStatusEnum {
  PENDING = 'PENDING',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
```

## Authentication

All admin endpoints require authentication using JWT tokens.

- **Token Format**: Bearer token in Authorization header
- **Admin Check**: Middleware ensures the user has admin privileges

### Authentication Middleware

Two authentication middleware functions are available:
- `authenticateToken`: Verifies JWT token validity
- `isAdmin`: Verifies JWT token and checks admin role

## File Uploads

Blog post creation and updates support file uploads for hero images:

- **Upload Field**: `heroImage`
- **Format**: Multipart form data
- **File Types**: jpeg, jpg, png, webp

## Request Processing

The blog API includes middleware for processing requests:

1. `handleFormData`: Handles multipart/form-data requests with file uploads
2. `parseRequestData`: Parses and normalizes request data fields
3. `logRequest`: Logs request information for debugging

## Error Handling

API errors follow a consistent format:

```typescript
interface IApiError {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: any;
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Frontend API Consumption

Frontend services should use the following pattern for API consumption:

```typescript
// Example API call
async function fetchResource() {
  try {
    const response = await fetch('/api/resource');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
```

### Frontend Services

The frontend implements service classes for API interaction:

- **AdminService**: Manages admin configuration settings
- **FeatureFlagService**: Handles feature flags
- **TimerService**: Manages scheduling and delay settings

These services follow a singleton pattern with reactive state:

```typescript
class ApiService {
  private static instance: ApiService;
  
  private constructor() {}
  
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  // API methods
}
```

## API Development Guidelines

1. **Versioning**: Use appropriate versioning for breaking changes (e.g., `/api/v1/...`, `/api/v2/...`)
2. **Consistency**: Maintain consistent naming and structure across endpoints
3. **Documentation**: Update this documentation when adding or modifying endpoints
4. **Backward Compatibility**: Maintain backward compatibility where possible
5. **Error Handling**: Provide meaningful error messages and appropriate status codes
6. **Authentication**: Secure sensitive endpoints with proper authentication
7. **Validation**: Validate request data before processing
8. **Response Format**: Use consistent response formats

## Potential Improvements

1. Implement GraphQL for more flexible data querying
2. Add API request validation using a schema validation library
3. Implement rate limiting for public endpoints
4. Add automated API documentation generation with Swagger/OpenAPI
5. Implement WebSockets for real-time features
6. Standardize all API endpoints under a unified versioning scheme
7. Add comprehensive API tests
8. Implement API request logging and metrics 