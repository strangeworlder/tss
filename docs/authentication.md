# Authentication System Documentation

## Overview

This document outlines the authentication system used in our application. It serves as the single source of truth for both frontend and backend implementations.

## Authentication Flow

1. **User Login**: User provides credentials (email/password) via the login form
2. **Token Generation**: Backend validates credentials and generates a JWT token
3. **Token Storage**: 
   - Frontend stores token in localStorage
   - Backend stores token reference in Redis for validation
4. **Token Usage**: All secure API calls include the token in the Authorization header
5. **Token Verification**: Backend validates token for protected routes
6. **Token Expiration**: Tokens expire after 24 hours by default

## Frontend Implementation

### Token Storage

```typescript
// Store token after login
localStorage.setItem('token', tokenFromResponse);

// Remove token on logout
localStorage.removeItem('token');
```

### API Authentication

All API requests requiring authentication must use the apiClient helpers which automatically handle token inclusion:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/api/apiClient';

// Examples
const response = await apiGet<IUser>('/v1/user/profile');
const response = await apiPost<IPost>('/v1/blog', postData);
const response = await apiPut<IPost>(`/v1/blog/id/${id}`, updates);
```

The apiClient automatically:
1. Retrieves the token from localStorage
2. Adds the Authorization header with the Bearer token
3. Handles different request types (JSON or FormData)

### Form Uploads with Authentication

For multipart/form-data uploads (like image uploads), always use the apiClient methods instead of direct fetch:

```typescript
// CORRECT: Use apiPost/apiPut for FormData
const response = await apiPost<IBlogPost>('/v1/blog', formData);

// INCORRECT: Direct fetch doesn't include auth headers properly
const response = await fetch(url, {
  method: 'POST',
  body: formData  // Missing Authorization header
});
```

## Backend Implementation

### Token Generation

```typescript
// Generate JWT token with user information
const token = jwt.sign({
  id: user.id,
  email: user.email,
  role: user.role
}, SECRET_KEY, {
  expiresIn: '24h'
});

// Store token in Redis
await redis.set(`token:${user.id}`, token, 'EX', 86400); // 24 hours
```

### Token Verification Middleware

```typescript
// Verify token middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  try {
    // Decode token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Check if token exists in Redis
    const storedToken = await redis.get(`token:${decoded.id}`);
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token verification failed' 
    });
  }
};
```

### Admin Authorization

```typescript
// Admin check middleware
const isAdmin = async (req, res, next) => {
  // First authenticate the token
  authenticateToken(req, res, () => {
    // Check if user has admin role
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Requires admin privileges' 
      });
    }
  });
};
```

## Routes That Require Authentication

| Endpoint | Method | Authentication | Admin Required |
|----------|--------|----------------|---------------|
| `/api/v1/auth/login` | POST | No | No |
| `/api/v1/auth/register` | POST | No | No |
| `/api/v1/auth/refresh` | POST | Yes | No |
| `/api/v1/auth/logout` | POST | Yes | No |
| `/api/v1/user/profile` | GET | Yes | No |
| `/api/v1/user/profile` | PUT | Yes | No |
| `/api/v1/blog` | GET | No | No |
| `/api/v1/blog/:slug` | GET | No | No |
| `/api/v1/blog/tag/:tag` | GET | No | No |
| `/api/v1/blog` | POST | Yes | Yes |
| `/api/v1/blog/id/:id` | PUT | Yes | Yes |
| `/api/v1/blog/id/:id` | DELETE | Yes | Yes |
| `/api/v1/blog/admin/all` | GET | Yes | Yes |
| `/api/v1/scheduled-content` | GET | Yes | No |
| `/api/v1/scheduled-content/:id` | GET | Yes | No |
| `/api/v1/scheduled-content/:id/cancel` | POST | Yes | No |
| `/api/v1/scheduled-content/:id/retry` | POST | Yes | No |

## Token Structure

```typescript
// JWT Payload structure
interface TokenPayload {
  id: string;        // User ID
  email: string;     // User email
  role: string;      // User role (admin, editor, user)
  iat: number;       // Issued at timestamp
  exp: number;       // Expiration timestamp
}
```

## Error Handling

Authentication errors follow a consistent format:

```typescript
interface AuthError {
  success: false;
  message: string;    // Human-readable error message
  error?: string;     // Technical error details (in development)
}
```

Common HTTP status codes:
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)

## Best Practices

1. **Never** store sensitive user data in the JWT token
2. **Always** use HTTPS in production
3. **Always** validate tokens on every secure request
4. **Always** use the apiClient methods for authenticated requests
5. **Never** use direct fetch for secured endpoints
6. **Always** handle token expiration gracefully
7. **Never** expose the token in URLs or logs
8. For FormData uploads, use apiClient to ensure proper authentication headers

## Troubleshooting

Common authentication issues:

1. **401 Unauthorized**: 
   - Check if token exists in localStorage
   - Ensure token is being included in request headers
   - Verify token hasn't expired
   - Check Redis for token validity

2. **403 Forbidden**:
   - Verify user has required role (admin)
   - Check permissions in the database

3. **Token Not Being Sent**:
   - For FormData requests, ensure apiPost/apiPut is used instead of direct fetch
   - Check for CORS issues when testing across domains 