import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IUser } from '@/types/user';

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

export const useAuthStore = defineStore('auth', () => {
  const state = ref<IAuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: [],
  });

  const user = computed(() => state.value.user);
  const isAuthenticated = computed(() => state.value.isAuthenticated);
  const permissions = computed(() => state.value.permissions);

  const hasPermission = (permission: string) => {
    return state.value.permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every((permission) => hasPermission(permission));
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // TODO: Implement actual login logic
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      state.value = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        permissions: data.permissions,
      };

      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // TODO: Implement actual logout logic
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.value.token}`,
        },
      });

      // Clear state
      state.value = {
        user: null,
        token: null,
        isAuthenticated: false,
        permissions: [],
      };

      // Remove token from localStorage
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token found');
      }

      // TODO: Implement actual token validation
      const response = await fetch('/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      state.value = {
        user: data.user,
        token,
        isAuthenticated: true,
        permissions: data.permissions,
      };
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear state on error
      state.value = {
        user: null,
        token: null,
        isAuthenticated: false,
        permissions: [],
      };
      localStorage.removeItem('auth_token');
    }
  };

  return {
    state,
    user,
    isAuthenticated,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    login,
    logout,
    checkAuth,
  };
});
