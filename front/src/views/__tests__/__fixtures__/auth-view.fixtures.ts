/**
 * Fixtures for AuthView component tests
 */

/**
 * Mock data for login form
 */
export const mockLoginFormData = {
  email: 'test@example.com',
  password: 'password123',
};

/**
 * Mock data for register form
 */
export const mockRegisterFormData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

/**
 * Mock error response from authentication API
 */
export const mockAuthError = {
  message: 'Invalid credentials',
  code: 'AUTH_ERROR',
};

/**
 * Mock successful authentication response
 */
export const mockAuthSuccess = {
  token: 'mock-jwt-token',
  user: {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
  },
};
