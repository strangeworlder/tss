/**
 * Base API client for making requests to the backend
 */

import type { ApiResponse } from '@/types/blog';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// HTTP request methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request options
interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
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
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    signal: AbortSignal.timeout(timeout)
  };
  
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }
  
  try {
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
  try {
    const response = await fetch(`${API_BASE_URL}/healthcheck`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Typed wrapper for API responses
 */
export async function apiGet<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<ApiResponse<T>>(endpoint, { ...options, method: 'GET' });
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