import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import AdminView from '../AdminView.vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import type { Store } from 'pinia';
import type { IUser } from '@/types/user';
import { UserRole } from '@/types/user';

// Mock the stores and router
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAdmin: true,
    user: null,
    loading: false,
    error: null,
    token: null,
    isAuthenticated: false,
    isEditor: false,
    userRole: null,
    fetchUserData: vi.fn(),
    setAuthData: vi.fn(),
    clearAuthData: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('AdminView', () => {
  let wrapper: VueWrapper;
  const router = useRouter();

  beforeEach(() => {
    wrapper = mount(AdminView, {
      global: {
        stubs: {
          BlogPostList: true,
          BlogPostEditor: true,
          BaseView: true,
          Tabs: true,
        },
      },
    });
  });

  describe('Authorization', () => {
    it('should redirect non-admin users to home', async () => {
      vi.mocked(useAuthStore).mockReturnValueOnce({
        isAdmin: false,
        user: null,
        loading: false,
        error: null,
        token: null,
        isAuthenticated: false,
        isEditor: false,
        userRole: null,
        fetchUserData: vi.fn(),
        setAuthData: vi.fn(),
        clearAuthData: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      } as unknown as ReturnType<typeof useAuthStore>);

      mount(AdminView);
      expect(router.push).toHaveBeenCalledWith('/');
    });

    it('should allow admin users to access the view', () => {
      expect(wrapper.find('.admin-view__title').text()).toBe('Blog Admin');
    });
  });

  describe('Tab Navigation', () => {
    it('should start with list view', () => {
      expect(wrapper.findComponent({ name: 'BlogPostList' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'BlogPostEditor' }).exists()).toBe(false);
    });

    it('should switch to editor view when creating new post', async () => {
      const tabs = wrapper.findComponent({ name: 'Tabs' });
      await tabs.vm.$emit('update:modelValue', 'editor');
      expect(wrapper.findComponent({ name: 'BlogPostEditor' }).exists()).toBe(true);
    });

    it('should switch to editor view with post ID when editing', async () => {
      const postId = 'test-post-id';
      const list = wrapper.findComponent({ name: 'BlogPostList' });
      await list.vm.$emit('edit-post', postId);
      const editor = wrapper.findComponent({ name: 'BlogPostEditor' });
      expect(editor.exists()).toBe(true);
      expect(editor.props('postId')).toBe(postId);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      expect(wrapper.find('[role="main"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Blog administration"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Admin view sections"]').exists()).toBe(true);
    });

    it('should maintain proper heading hierarchy', () => {
      const h1 = wrapper.find('h1');
      expect(h1.exists()).toBe(true);
      expect(h1.text()).toBe('Blog Admin');
    });
  });
});
