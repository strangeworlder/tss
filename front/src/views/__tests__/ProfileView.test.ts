import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfileView from '../ProfileView.vue';
import type { IUser } from '@/types/user';
import type { UserRole } from '@/types/user';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin' as UserRole,
      avatar: {
        filename: 'avatar.jpg',
        altText: 'Profile picture',
      },
    },
    token: 'mock-token',
    fetchUserData: vi.fn(),
  })),
}));

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  const createWrapper = () => {
    return mount(ProfileView);
  };

  describe('Rendering', () => {
    it('renders the component with user data', () => {
      const wrapper = createWrapper();

      // Check if user information is displayed correctly
      expect(wrapper.text()).toContain('John Doe');
      expect(wrapper.text()).toContain('john.doe@example.com');
      expect(wrapper.text()).toContain('Administrator');
    });

    it('renders the avatar with correct props', () => {
      const wrapper = createWrapper();
      const avatar = wrapper.findComponent({ name: 'UserAvatar' });

      expect(avatar.exists()).toBe(true);
      expect(avatar.props('src')).toBe('avatar.jpg');
      expect(avatar.props('alt')).toBe('John');
      expect(avatar.props('size')).toBe('lg');
    });

    it('renders the change profile picture button', () => {
      const wrapper = createWrapper();
      const button = wrapper.findComponent({ name: 'AppButton' });

      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Change Profile Picture');
    });
  });

  describe('Avatar Upload', () => {
    it('handles successful avatar upload', async () => {
      const wrapper = createWrapper();
      const { useAuthStore } = await import('@/stores/authStore');
      const store = useAuthStore();

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Trigger file upload
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = wrapper.find('input[type="file"]');
      await input.trigger('change', { target: { files: [file] } });

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/users/avatar'),
        expect.objectContaining({
          method: 'POST',
          headers: { Authorization: 'Bearer mock-token' },
        })
      );

      // Verify store action was called
      expect(store.fetchUserData).toHaveBeenCalled();

      // Verify success message
      expect(wrapper.text()).toContain('Profile picture updated successfully');
    });

    it('handles failed avatar upload', async () => {
      const wrapper = createWrapper();

      // Mock failed API response
      mockFetch.mockRejectedValueOnce(new Error('Failed to update profile picture'));

      // Trigger file upload
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = wrapper.find('input[type="file"]');
      await input.trigger('change', { target: { files: [file] } });

      // Verify error message
      expect(wrapper.text()).toContain('Failed to update profile picture');
    });

    it('shows loading state during upload', async () => {
      const wrapper = createWrapper();

      // Mock delayed API response
      mockFetch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Trigger file upload
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = wrapper.find('input[type="file"]');
      await input.trigger('change', { target: { files: [file] } });

      // Verify loading state
      const button = wrapper.findComponent({ name: 'AppButton' });
      expect(button.text()).toBe('Uploading...');
      expect(button.props('disabled')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const wrapper = createWrapper();
      const h1 = wrapper.find('h1');

      expect(h1.exists()).toBe(true);
      expect(h1.text()).toBe('My Profile');
    });

    it('has proper labels for form elements', () => {
      const wrapper = createWrapper();
      const labels = wrapper.findAll('label');

      expect(labels.length).toBe(3); // Name, Email, User Level
      expect(labels.map((label) => label.text())).toContain('Name');
      expect(labels.map((label) => label.text())).toContain('Email');
      expect(labels.map((label) => label.text())).toContain('User Level');
    });

    it('has accessible file input', () => {
      const wrapper = createWrapper();
      const input = wrapper.find('input[type="file"]');

      expect(input.attributes('accept')).toBe('image/*');
    });
  });

  describe('Responsive Design', () => {
    it('applies correct responsive classes', () => {
      const wrapper = createWrapper();

      expect(wrapper.classes()).toContain('profile-view');
      expect(wrapper.find('.profile-view__container').exists()).toBe(true);
      expect(wrapper.find('.profile-view__section').exists()).toBe(true);
    });
  });
});
