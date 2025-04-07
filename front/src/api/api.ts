import axios from 'axios'

// The API base URL should not include /api/v1 since it's part of the endpoint paths
const DEFAULT_API_URL = 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  let token: string | null = null
  try {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const auth = JSON.parse(authData)
      token = auth.token
    }
  } catch (e) {
    console.warn('Failed to parse auth data from localStorage')
  }

  token = token || localStorage.getItem('token')

  console.log('API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    hasToken: !!token,
  })

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      dataStructure: Object.keys(response.data),
    })
    return response
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data,
    })

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('auth')
    }

    return Promise.reject(error)
  },
)
