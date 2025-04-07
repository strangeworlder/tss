/**
 * Pinia Type Declarations
 * This file extends the Pinia types to ensure proper TypeScript support
 */

import 'pinia';
import type { Router } from 'vue-router';
import type { Notification } from '@/stores/notification';
import type { BlogPost, BlogPostPreview } from '@/types/blog';
import type { IUser } from '@/types/user';

declare module 'pinia' {
  export interface PiniaCustomProperties {
    // Global properties available in all stores
    $router: Router;
  }

  export interface PiniaCustomStateProperties {
    // Global state properties available in all stores
    $loading: boolean;
    $error: string | null;
  }
}

// Store-specific type declarations
export interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export interface CounterStore {
  count: number;
  doubleCount: number;
  increment: () => void;
}

export interface BlogStore {
  posts: BlogPostPreview[];
  currentPost: BlogPost | null;
  loading: boolean;
  error: string | null;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  postsByTag: (tag: string) => BlogPostPreview[];
  fetchPosts: (limit?: number) => Promise<void>;
  fetchAdminPosts: (limit?: number) => Promise<void>;
  fetchPostBySlug: (slug: string) => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  fetchPostsByTag: (tag: string, limit?: number) => Promise<void>;
  createPost: (formData: FormData) => Promise<BlogPost>;
  updatePost: (id: string, formData: FormData) => Promise<BlogPost>;
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string }) => void;
  clearNotification: () => void;
}

export interface AuthStore {
  // State
  currentUser: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Getters
  isAuthenticated: boolean;
  userRole: string | null;
  isAdmin: boolean;

  // Actions
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

export interface UserStore {
  users: IUser[];
  fetchUsers: () => Promise<IUser[]>;
}

// Re-export Pinia core functionality
export {
  createPinia,
  defineStore,
  storeToRefs,
  setActivePinia,
  getActivePinia,
} from 'pinia';
