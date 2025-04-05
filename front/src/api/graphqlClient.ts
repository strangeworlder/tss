import { API_BASE_URL } from '@/config'

interface GraphQLResponse<T = any> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: string[]
    extensions?: Record<string, any>
  }>
}

interface GraphQLRequestOptions {
  variables?: Record<string, any>
  headers?: Record<string, string>
}

class GraphQLClient {
  private endpoint: string

  constructor(endpoint: string = `${API_BASE_URL}/graphql`) {
    this.endpoint = endpoint
  }

  private async request<T = any>(
    query: string,
    options: GraphQLRequestOptions = {},
  ): Promise<GraphQLResponse<T>> {
    const { variables = {}, headers = {} } = options

    // Get token from localStorage
    const token = localStorage.getItem('token')
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0].message)
    }

    return result
  }

  async query<T = any>(query: string, options: GraphQLRequestOptions = {}): Promise<T> {
    const response = await this.request<T>(query, options)
    return response.data as T
  }

  async mutation<T = any>(mutation: string, options: GraphQLRequestOptions = {}): Promise<T> {
    const response = await this.request<T>(mutation, options)
    return response.data as T
  }
}

// Create a singleton instance
export const graphqlClient = new GraphQLClient()
