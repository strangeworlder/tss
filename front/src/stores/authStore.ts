import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{
    id: string
    firstName: string
    lastName: string
    email: string
    role: UserRole
    avatar?: {
      filename: string
      altText: string
    }
    bio?: string
  } | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN)
  const isAuthor = computed(() => user.value?.role === UserRole.AUTHOR || isAdmin.value)

  // Initialize user data if token exists
  if (token.value) {
    fetchUserData()
  }

  async function fetchUserData() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
      const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      user.value = data.user
    } catch (error) {
      console.error('Error fetching user data:', error)
      clearAuthData()
    }
  }

  function setAuthData(userData: any, authToken: string) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
  }

  function clearAuthData() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  async function logout() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
      const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      clearAuthData()
    } catch (error) {
      console.error('Error during logout:', error)
      // Still clear local data even if the API call fails
      clearAuthData()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isAuthor,
    fetchUserData,
    setAuthData,
    clearAuthData,
    logout,
  }
})
