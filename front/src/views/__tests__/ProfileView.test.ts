import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';
import ProfileView from '@/views/ProfileView.vue';
import BaseView from '@/components/templates/BaseView.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import UserAvatar from '@/components/atoms/UserAvatar.vue';
import { UserRole } from '@/types/user';
import { useAuthStore } from '@/stores/authStore';
import { ref } from 'vue';
import {
  createProfileViewWrapper,
  mockUser,
  mockAuthStore,
  createMockFile,
  createMockFileList,
} from './profile-view.test-utils';

// Mock dependencies
vi.mock('@/components/templates/BaseView.vue', () => ({
  default: {
    name: 'BaseView',
    template: '<div><slot name="header"></slot><slot></slot><slot name="footer"></slot></div>',
    props: ['title', 'variant', 'showHeader', 'showFooter'],
  },
}));

vi.mock('@/components/atoms/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div class="loading-spinner">{{ text }}</div>',
    props: ['size', 'text'],
  },
}));

vi.mock('@/components/atoms/AppButton.vue', () => ({
  default: {
    name: 'AppButton',
    template: '<button><slot></slot></button>',
    props: ['variant', 'disabled'],
  },
}));

vi.mock('@/components/atoms/UserAvatar.vue', () => ({
  default: {
    name: 'UserAvatar',
    template: '<div class="user-avatar"><img :src="src" :alt="alt" /></div>',
    props: ['src', 'alt', 'size'],
  },
}));

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}));

interface ProfileViewInstance extends ComponentPublicInstance {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fileInput: HTMLInputElement | null;
  avatarPreview: string | null;
}

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = createProfileViewWrapper();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(BaseView).exists()).toBe(true);
    });

    it('renders loading state when loading is true', () => {
      const wrapper = createProfileViewWrapper({ loading: true });
      expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
    });

    it('renders error state when error is present', () => {
      const errorMessage = 'Test error message';
      const wrapper = createProfileViewWrapper({ error: errorMessage });
      expect(wrapper.find('.profile-view__error').exists()).toBe(true);
      expect(wrapper.find('.profile-view__error-text').text()).toBe(errorMessage);
    });

    it('renders empty state when no user data is available', () => {
      // Mock auth store with no user
      const emptyAuthStore = {
        user: ref(null),
        token: ref(null),
        loading: ref(false),
        error: ref(null),
        isAuthenticated: ref(false),
        isAdmin: ref(false),
        isEditor: ref(false),
        userRole: ref(null),
        fetchUserData: vi.fn(),
        setAuthData: vi.fn(),
        clearAuthData: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      };

      vi.mocked(useAuthStore).mockImplementationOnce(() => emptyAuthStore as any);

      const wrapper = createProfileViewWrapper();
      expect(wrapper.find('.profile-view__empty').exists()).toBe(true);
    });

    it('renders content when user data is available', () => {
      const wrapper = createProfileViewWrapper();
      expect(wrapper.find('.profile-view__content').exists()).toBe(true);
      expect(wrapper.find('.profile-view__section-title').text()).toBe('Profile Information');
    });

    it('displays user information correctly', () => {
      const wrapper = createProfileViewWrapper();
      expect(wrapper.text()).toContain('John Doe');
      expect(wrapper.text()).toContain('john.doe@example.com');
      expect(wrapper.text()).toContain('Regular User');
    });
  });

  // User interaction tests
  describe('User Interactions', () => {
    it('triggers file input when change profile picture button is clicked', async () => {
      const wrapper = createProfileViewWrapper();
      const instance = wrapper.vm as unknown as ProfileViewInstance;
      const mockClick = vi.fn();

      // Mock the click method on the file input
      if (instance.fileInput) {
        instance.fileInput.click = mockClick;
      }

      // Find and click the change profile picture button
      const button = wrapper.find('[data-test="change-profile-picture-button"]');
      await button.trigger('click');

      // Verify that the file input's click method was called
      expect(mockClick).toHaveBeenCalled();
    });

    it('handles file selection correctly', async () => {
      const wrapper = createProfileViewWrapper();
      const instance = wrapper.vm as unknown as ProfileViewInstance;
      const mockFile = createMockFile();
      const mockFileList = createMockFileList(mockFile);

      // Trigger file selection
      const input = wrapper.find('input[type="file"]');
      Object.defineProperty(input.element, 'files', {
        value: mockFileList,
      });
      await input.trigger('change');

      // Verify that loading state is activated
      expect(instance.loading).toBe(true);
    });

    it('handles missing user data gracefully', () => {
      const emptyAuthStore = {
        ...mockAuthStore,
        user: ref(null),
      };

      vi.mocked(useAuthStore).mockReturnValue(emptyAuthStore as any);

      const wrapper = createProfileViewWrapper();
      expect(() => wrapper.vm.$forceUpdate()).not.toThrow();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const wrapper = createProfileViewWrapper();
      const headings = wrapper.findAll('h1, h2');

      expect(headings.length).toBe(2);
      expect(headings[0].element.tagName).toBe('H1');
      expect(headings[1].element.tagName).toBe('H2');
    });

    it('provides proper labels for form elements', () => {
      const wrapper = createProfileViewWrapper();
      const fileInput = wrapper.find('.profile-view__file-input');

      expect(fileInput.attributes('aria-label')).toBe('Upload profile picture');
    });

    it('uses semantic HTML elements', () => {
      const wrapper = createProfileViewWrapper();

      expect(wrapper.find('section').exists()).toBe(true);
      expect(wrapper.find('label').exists()).toBe(true);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles API errors gracefully', async () => {
      const wrapper = createProfileViewWrapper();
      const fileInput = wrapper.find('.profile-view__file-input');

      // Mock fetch to return an error
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'));

      // Create a mock file
      const file = createMockFile();

      // Trigger change event with the file
      await fileInput.trigger('change', {
        target: {
          files: createMockFileList(file),
        },
      });

      // Wait for the async operation to complete
      await wrapper.vm.$nextTick();

      // Check if error state is displayed
      const vm = wrapper.vm as unknown as ProfileViewInstance;
      expect(vm.error).toBe('API Error');
    });

    it('handles missing user data gracefully', () => {
      // Mock auth store with incomplete user data
      const incompleteAuthStore = {
        ...mockAuthStore,
        user: ref({ ...mockUser, avatar: undefined }),
      };

      vi.mocked(useAuthStore).mockImplementationOnce(() => incompleteAuthStore as any);

      const wrapper = createProfileViewWrapper();

      // Check if the component renders without errors
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.profile-view__content').exists()).toBe(true);
    });
  });
});
