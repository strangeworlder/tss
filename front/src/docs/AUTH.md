# Authentication System Documentation

## Overview

Our authentication system uses JWT (JSON Web Tokens) for stateless authentication. The system consists of several components working together to manage user authentication state and API requests.

## Components

### 1. Auth Store (`stores/authStore.ts`)

The auth store is the central source of truth for authentication state using Pinia.

```typescript
// Key state
const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem('token'))

// Key computed properties
const isAuthenticated = computed(() => !!token.value)
const isAdmin = computed(() => user.value?.role === UserRole.ADMIN)
const isAuthor = computed(() => user.value?.role === UserRole.AUTHOR || isAdmin.value)
```

#### Key Functions:

- `setAuthData(userData, authToken)`: Stores user data and token
- `clearAuthData()`: Clears authentication state
- `fetchUserData()`: Retrieves user data using stored token
- `logout()`: Handles user logout

### 2. API Configuration (`api/api.ts`)

The API configuration handles token injection into requests and response handling.

```typescript
// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  },
)
```

### 3. Login Form (`components/organisms/LoginForm.vue`)

Handles user login and token storage.

```typescript
const handleSubmit = async () => {
  // ... validation ...
  const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })

  const data = await response.json()
  authStore.setAuthData(data.user, data.token)
}
```

## Authentication Flow

1. **Login Process**:

   - User submits login credentials
   - Backend validates and returns user data and JWT token
   - `authStore.setAuthData()` stores token in localStorage and user data in Pinia store

2. **API Requests**:

   - API interceptor automatically injects token into request headers
   - Format: `Authorization: Bearer <token>`

3. **Token Management**:

   - Token stored in localStorage with key `'token'`
   - Token automatically cleared on 401 responses
   - Token used for all authenticated API requests

4. **Logout Process**:
   - Calls backend logout endpoint
   - Clears local storage and Pinia store
   - Redirects to login page

## Common Issues and Solutions

1. **401 Unauthorized Errors**:

   - Check if token exists in localStorage
   - Verify token format in Authorization header
   - Ensure token hasn't expired
   - Check if token is being properly injected into requests

2. **Token Storage**:

   - Always use `'token'` as the localStorage key
   - Use `authStore.setAuthData()` to store tokens
   - Use `authStore.clearAuthData()` to clear tokens

3. **API Requests**:
   - Use the `api` instance from `api.ts` for all authenticated requests
   - Don't manually add Authorization headers
   - Let the interceptor handle token injection

## Best Practices

1. **Token Storage**:

   ```typescript
   // ✅ Correct way to store token
   localStorage.setItem('token', token)

   // ❌ Don't use different keys
   localStorage.setItem('auth', token)
   ```

2. **API Requests**:

   ```typescript
   // ✅ Correct way to make authenticated requests
   const response = await api.get('/endpoint')

   // ❌ Don't manually add headers
   const response = await fetch('/endpoint', {
     headers: { Authorization: `Bearer ${token}` },
   })
   ```

3. **Auth State Management**:

   ```typescript
   // ✅ Correct way to manage auth state
   const authStore = useAuthStore()
   authStore.setAuthData(user, token)

   // ❌ Don't manage auth state outside the store
   localStorage.setItem('token', token)
   ```

## Testing Authentication

1. **Login Test**:

   ```typescript
   test('login stores token correctly', async () => {
     const authStore = useAuthStore()
     await authStore.login(credentials)
     expect(localStorage.getItem('token')).toBeTruthy()
   })
   ```

2. **API Request Test**:
   ```typescript
   test('API request includes token', async () => {
     const token = 'test-token'
     localStorage.setItem('token', token)
     const response = await api.get('/test')
     expect(response.config.headers.Authorization).toBe(`Bearer ${token}`)
   })
   ```

## Security Considerations

1. **Token Storage**:

   - Tokens are stored in localStorage (consider using httpOnly cookies for production)
   - Tokens are automatically cleared on 401 responses
   - Tokens are cleared on logout

2. **API Security**:

   - All authenticated endpoints require valid JWT token
   - Tokens are validated on the backend
   - CORS is properly configured

3. **Error Handling**:
   - 401 responses trigger automatic token cleanup
   - Failed login attempts are properly handled
   - Network errors are caught and handled

## Maintenance

When making changes to the authentication system:

1. **Token Storage**:

   - Always use the auth store for token management
   - Keep using `'token'` as the localStorage key
   - Update both storage and retrieval methods together

2. **API Configuration**:

   - Update interceptors when changing token format
   - Maintain consistent error handling
   - Keep CORS configuration up to date

3. **Testing**:
   - Test login/logout flows
   - Verify token injection
   - Check error handling
   - Test token expiration
