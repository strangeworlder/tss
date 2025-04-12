import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IAuthor, IAuthorAuthState, AuthorPermission } from '@/types/author';

export const useAuthorStore = defineStore('author', () => {
  const state = ref<IAuthorAuthState>({
    token: localStorage.getItem('authorToken'),
    author: null,
    isAuthenticated: false,
  });

  const author = computed(() => state.value.author);
  const isAuthenticated = computed(() => state.value.isAuthenticated);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/author/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      state.value.token = data.token;
      state.value.author = data.author;
      state.value.isAuthenticated = true;

      localStorage.setItem('authorToken', data.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    state.value.token = null;
    state.value.author = null;
    state.value.isAuthenticated = false;
    localStorage.removeItem('authorToken');
  };

  const checkAuth = async () => {
    if (!state.value.token) {
      return false;
    }

    try {
      const response = await fetch('/api/author/verify', {
        headers: {
          Authorization: `Bearer ${state.value.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      state.value.author = data.author;
      state.value.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Auth verification error:', error);
      logout();
      return false;
    }
  };

  const hasPermission = (permission: AuthorPermission) => {
    return state.value.author?.permissions.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: AuthorPermission[]) => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: AuthorPermission[]) => {
    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    state,
    author,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
});
