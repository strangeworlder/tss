import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IUser } from '@/types/user';
import { API_BASE_URL } from '@/config';
import { useAuthStore } from './authStore';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {
  const users = ref<IUser[]>([]);
  const authStore = useAuthStore();
  const router = useRouter();

  async function fetchUsers(): Promise<IUser[]> {
    try {
      if (!authStore.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/v1/users`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      if (response.status === 401) {
        // Token expired or invalid
        authStore.clearAuthData();
        router.push('/auth');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      users.value = data.data;
      return data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  return {
    users,
    fetchUsers
  };
}); 