/**
 * Base API client for making requests to the backend
 */

import type { ApiResponse } from '@/types/blog';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// HTTP request methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request options
interface RequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: any;
  timeout?: number;
}

// Error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Make an API request
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT
  } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  console.log('Retrieved token:', token ? 'yes' : 'no'); // Debug log
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      ...headers,
      // Add authorization header if token exists
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    signal: AbortSignal.timeout(timeout)
  };
  
  // Handle FormData differently from JSON
  if (body instanceof FormData) {
    // Don't set Content-Type header for FormData, let the browser set it with the boundary
    requestOptions.body = body;
  } else if (body) {
    // For JSON data
    requestOptions.headers = {
      ...requestOptions.headers,
      'Content-Type': 'application/json'
    };
    requestOptions.body = JSON.stringify(body);
  }
  
  try {
    console.log('API Request:', {
      url,
      method,
      headers: requestOptions.headers,
      body: body instanceof FormData 
        ? Object.fromEntries(body.entries())
        : body
    });
    
    const response = await fetch(url, requestOptions);
    
    // Parse the JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new ApiError('Invalid JSON response', response.status);
    }
    
    // Check if response is successful
    if (!response.ok) {
      const errorMessage = data?.message || `API error: ${response.status} ${response.statusText}`;
      throw new ApiError(errorMessage, response.status);
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

/**
 * Check if the API server is available
 */
export async function checkApiHealth(): Promise<boolean> {
  const healthUrl = `${API_BASE_URL}/health`;
  console.log('Checking API health at URL:', healthUrl);
  
  try {
    console.log('Attempting fetch request...');
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Fetch response received:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('API health check failed details:', error);
    return false;
  }
}

// Generic GET method
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<ApiResponse<T>>(endpoint, { method: 'GET' });
}

export async function apiPost<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<ApiResponse<T>>(endpoint, { ...options, method: 'POST', body: data });
}

export async function apiPut<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<ApiResponse<T>>(endpoint, { ...options, method: 'PUT', body: data });
}

export async function apiDelete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<ApiResponse<T>>(endpoint, { ...options, method: 'DELETE' });
} 