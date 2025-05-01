# Blog Post Structure Documentation

## Overview

This document defines the optimal structure for blog posts in our system, ensuring consistency between frontend and backend implementations while properly integrating with "The Slow" feature. This document serves as the single source of truth for all blog post implementations.

## Core Blog Post Model

```typescript
interface IBlogPost {
  // Core fields
  id: string;                   // Unique identifier
  title: string;                // Post title
  slug: string;                 // URL-friendly version of title
  content: string;              // Main content (markdown format)
  excerpt: string;              // Short summary for previews
  
  // Author information
  author: {
    type: 'user' | 'text';      // User reference or custom text
    id?: string;                // User ID (required if type is 'user')
    name: string;               // Display name
    avatar?: {                  // Optional author image
      filename: string;
      altText: string;
    }
  };
  
  // Media
  heroImage?: {                 // Optional featured image
    filename: string;
    altText: string;
  };
  
  // Categorization
  tags: string[];               // Topic tags for filtering/grouping
  
  // Publication metadata
  createdAt: string;            // Creation timestamp
  updatedAt: string;            // Last update timestamp
  
  // The Slow integration
  status: BlogPostStatus;       // Current state (DRAFT, SCHEDULED, PUBLISHED, etc.)
  publishAt?: string;           // Scheduled publication date
  timezone: string;             // Timezone for scheduling (default: 'UTC')
  
  // Version control
  version: number;              // Content version counter
  hasActiveUpdate: boolean;     // Flag for pending content updates
  pendingUpdateId?: string;     // Reference to pending update if exists
  
  // Moderation
  moderationStatus: BlogPostModerationStatus; // Moderation state
  abuseScore: number;           // Automated abuse detection score
  lastModeratedAt?: string;     // Last moderation timestamp
}

enum BlogPostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED'
}

enum BlogPostModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED'
}
```

## Integration with The Slow Feature

Blog posts integrate with "The Slow" feature through the following mechanisms:

1. **Status Management**: The `status` field tracks a post's progress through The Slow workflow
2. **Scheduled Publication**: The `publishAt` field determines when a post will be published
3. **Version Control**: The `version`, `hasActiveUpdate`, and `pendingUpdateId` fields manage content updates during the delay period

## Content Flow States

A blog post progresses through the following states:

1. **DRAFT**: Initial creation, not yet scheduled
2. **SCHEDULED**: Awaiting publication based on the configured delay
3. **PUBLISHING**: In process of being published
4. **PUBLISHED**: Available to readers
5. **FAILED**: Publication attempt failed
6. **ARCHIVED**: Removed from active display

## Relationships with Other Entities

1. **Authors**: Posts are linked to an author, either a system user or a custom name
2. **Comments**: Posts may have associated comments (stored separately)
3. **Scheduled Content**: Posts may have an entry in the scheduled content system

## Storage Considerations

1. **Database**: Blog posts are stored in MongoDB with appropriate indexing on `slug`, `status`, and `tags`
2. **Media Storage**: Hero images are stored in an object storage system with CDN delivery
3. **Offline Support**: Blog posts support offline creation with sync capabilities

## API Endpoints

See `docs/api-documentation.md` for the complete API details. Key endpoints include:

- `GET /api/v1/blog` - List published posts
- `GET /api/v1/blog/:slug` - Get post by slug
- `POST /api/v1/blog` - Create a new post
- `PUT /api/v1/blog/id/:id` - Update a post
- `DELETE /api/v1/blog/id/:id` - Delete a post

## Frontend Components

The blog post structure is used by the following key components:

1. **BlogPostEditor**: For creating and editing posts
2. **BlogPost**: For displaying a complete post
3. **BlogPostList**: For displaying post collections
4. **ScheduledPostPreview**: For displaying posts awaiting publication

## Best Practices

1. **Data Validation**:
   - Validate content on both client and server
   - Sanitize user inputs to prevent XSS
   - Enforce required fields

2. **Content Management**:
   - Use markdown for content formatting
   - Process content safely with HTML sanitization
   - Support media embeds in content

3. **Performance**:
   - Implement pagination for post lists
   - Use appropriate indexing strategies
   - Cache frequently accessed posts

4. **Security**:
   - Authenticate API requests for creation/modification
   - Validate author permissions
   - Implement rate limiting for public endpoints 