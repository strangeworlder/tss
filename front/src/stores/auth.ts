import { defineStore } from 'pinia'
import type { IUser } from '../types/user'
import type { IAuthState } from '../types/auth'
import { login as loginApi, logout as logoutApi } from '../api/authService'
import { UserRole } from '../types/user'

interface AuthStore extends IAuthState {
  isAuthenticated: boolean
  userRole: string | null
  isAdmin: boolean
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
}

export const useAuthStore = defineStore<'auth', AuthStore>('auth', {
  state: (): IAuthState => ({
    token: null,
    currentUser: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated(state: IAuthState): boolean {
      return !!state.token
    },
    userRole(state: IAuthState): string | null {
      return state.currentUser?.role || null
    },
    isAdmin(state: IAuthState): boolean {
      return state.currentUser?.role === UserRole.ADMIN
    }
  },

  actions: {
    async login(email: string, password: string): Promise<void> {
      try {
        this.loading = true
        this.error = null
        const response = await loginApi({ email, password })
        this.token = response.token
        this.currentUser = response.user
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout(): Promise<void> {
      try {
        await logoutApi()
        this.token = null
        this.currentUser = null
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Logout failed'
        throw err
      }
    }
  }
})
