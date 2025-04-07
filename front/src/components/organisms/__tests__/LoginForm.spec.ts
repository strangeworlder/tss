import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import LoginForm from '../LoginForm.vue';

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: { template: '<div>Home</div>' },
    },
  ],
});

// Mock auth store
const mockSetAuthData = vi.fn();
const mockAuthStore = {
  setAuthData: mockSetAuthData,
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders login form with email and password fields', () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('h2').text()).toBe('Login to Your Account');
    expect(wrapper.findAllComponents({ name: 'FormGroup' })).toHaveLength(2);
  });

  it('validates email field', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    });

    // Test empty email
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test invalid email
    await wrapper.find('input[type="email"]').setValue('invalid-email');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test valid email
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(false);
  });

  it('validates password field', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    });

    // Test empty password
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test valid password
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(false);
  });

  it('handles successful login', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    });

    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          user: { id: 1, name: 'Test User' },
          token: 'test-token',
        }),
    });

    // Fill form
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');

    // Verify auth store was called
    expect(mockSetAuthData).toHaveBeenCalledWith({ id: 1, name: 'Test User' }, 'test-token');
  });

  it('handles login error', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    });

    // Mock failed API response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: 'Invalid credentials',
        }),
    });

    // Fill form
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');

    // Verify error message is displayed
    expect(wrapper.find('.form-error').text()).toBe('Invalid credentials');
  });

  it('shows loading state during submission', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    });

    // Mock delayed API response
    global.fetch = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    // Fill form and submit
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');

    // Verify loading state
    expect(wrapper.find('button').text()).toBe('Logging in...');
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
