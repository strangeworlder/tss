import type { IUser } from './user'

export interface IAuthState {
  token: string | null
  currentUser: IUser | null
  loading: boolean
  error: string | null
}

export interface ILoginResponse {
  token: string
  user: IUser
}

export interface ILoginCredentials {
  email: string
  password: string
}
