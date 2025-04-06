import type { ILoginCredentials, ILoginResponse } from '@/types/auth'
import { api } from './api'

export const login = async (credentials: ILoginCredentials): Promise<ILoginResponse> => {
  const response = await api.post<ILoginResponse>('/auth/login', credentials)
  return response.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
} 