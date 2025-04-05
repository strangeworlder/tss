import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const currentUser = ref<User | null>(null)
    const token = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value)
    const user = computed(() => currentUser.value)

    function setUser(user: User | null): void {
      currentUser.value = user
    }

    function setToken(newToken: string | null): void {
      token.value = newToken
    }

    function logout(): void {
      currentUser.value = null
      token.value = null
    }

    return {
      currentUser,
      token,
      isAuthenticated,
      user,
      setUser,
      setToken,
      logout,
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'auth',
          storage: localStorage,
          paths: ['token'],
        },
      ],
    },
  },
)
