import { vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import type { IUser } from '@/types/user';
import { UserRole } from '@/types/user';
import { ref, computed } from 'vue';

// Mock user data
export const mockUser: IUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: UserRole.USER,
  avatar: { filename: 'avatar.jpg', altText: "John Doe's profile picture" },
};

// Mock auth store
export const mockAuthStore = {
  user: ref(mockUser),
  token: ref('mock-token'),
  loading: ref(false),
  error: ref(null),
  isAuthenticated: computed(() => true),
  isAdmin: computed(() => false),
  isEditor: computed(() => false),
  userRole: computed(() => UserRole.USER),
  fetchUserData: vi.fn(),
  setAuthData: vi.fn(),
  clearAuthData: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
};

// Create test wrapper
export const createProfileViewWrapper = (props = {}) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: () => import('@/views/ProfileView.vue'),
      },
    ],
  });

  setActivePinia(createPinia());

  return mount(import('@/views/ProfileView.vue'), {
    props,
    global: {
      plugins: [router],
      stubs: {
        BaseView: true,
        LoadingSpinner: true,
        AppButton: true,
        UserAvatar: true,
      },
    },
  });
};

// Utility functions for file testing
export const createMockFile = () => {
  return new File(['test'], 'test.jpg', { type: 'image/jpeg' });
};

export const createMockFileList = (file: File) => {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  return dataTransfer.files;
};
