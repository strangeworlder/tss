import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IUser } from '@/types/user';
import { UserRole } from '@/types/user';
import { login as loginApi, logout as logoutApi } from '@/api/authService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IUser | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);
  const isEditor = computed(() => user.value?.role === UserRole.EDITOR || isAdmin.value);
  const isAuthor = computed(
    () => user.value?.role === UserRole.AUTHOR || isEditor.value || isAdmin.value
  );
  const userRole = computed(() => user.value?.role || null);
  const currentUser = computed(() => user.value);

  // Initialize user data if token exists
  if (token.value) {
    fetchUserData();
  }

  async function fetchUserData() {
    try {
      loading.value = true;
      error.value = null;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      user.value = data.user;
    } catch (err: unknown) {
      console.error('Error fetching user data:', err);
      clearAuthData();
      error.value = err instanceof Error ? err.message : 'Failed to fetch user data';
    } finally {
      loading.value = false;
    }
  }

  function setAuthData(userData: IUser, authToken: string) {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('token', authToken);
  }

  function clearAuthData() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  async function login(email: string, password: string): Promise<void> {
    try {
      loading.value = true;
      error.value = null;

      const response = await loginApi({ email, password });
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem('token', response.token);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      loading.value = true;
      error.value = null;

      await logoutApi();
      clearAuthData();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed';
      // Still clear local data even if the API call fails
      clearAuthData();
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    currentUser,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isEditor,
    isAuthor,
    userRole,
    fetchUserData,
    setAuthData,
    clearAuthData,
    login,
    logout,
  };
});
