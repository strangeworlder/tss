import { defineStore } from 'pinia';
import type { User } from '@/types/user';

interface AuthState {
  currentUser: User | null;
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    token: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    user: (state) => state.currentUser
  },

  actions: {
    setUser(user: User | null) {
      this.currentUser = user;
    },

    setToken(token: string | null) {
      this.token = token;
    },

    logout() {
      this.currentUser = null;
      this.token = null;
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: localStorage,
        paths: ['token']
      }
    ]
  }
}); 