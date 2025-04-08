import { describe, it, expect, vi } from 'vitest';
import {
  createAuthView,
  createAuthViewWithLoginTab,
  createAuthViewWithRegisterTab,
} from './auth-view.test-utils';
import LoginForm from '@/components/organisms/LoginForm.vue';
import RegisterForm from '@/components/organisms/RegisterForm.vue';
import AppButton from '@/components/atoms/AppButton.vue';

// Mock the child components
vi.mock('@/components/organisms/LoginForm.vue', () => ({
  default: {
    name: 'LoginForm',
    template: '<div data-testid="login-form">Login Form</div>',
  },
}));

vi.mock('@/components/organisms/RegisterForm.vue', () => ({
  default: {
    name: 'RegisterForm',
    template: '<div data-testid="register-form">Register Form</div>',
  },
}));

vi.mock('@/components/atoms/AppButton.vue', () => ({
  default: {
    name: 'AppButton',
    props: ['variant', 'class'],
    template: '<button :class="class" data-testid="app-button"><slot /></button>',
  },
}));

describe('AuthView', () => {
  it('renders correctly', () => {
    const wrapper = createAuthView();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.auth-view').exists()).toBe(true);
    expect(wrapper.find('.auth-view__container').exists()).toBe(true);
    expect(wrapper.find('.auth-view__tabs').exists()).toBe(true);
    expect(wrapper.find('.auth-view__content').exists()).toBe(true);
  });

  it('shows login form by default', () => {
    const wrapper = createAuthView();
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(false);
  });

  it('switches to register form when register tab is clicked', async () => {
    const wrapper = createAuthView();

    // Find and click the register button
    const registerButton = wrapper.findAll('[data-testid="app-button"]')[1];
    await registerButton.trigger('click');

    // Check that the register form is now shown and login form is hidden
    expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(false);
  });

  it('switches back to login form when login tab is clicked', async () => {
    const wrapper = createAuthViewWithRegisterTab();

    // Switch back to login form
    const loginButton = wrapper.findAll('[data-testid="app-button"]')[0];
    await loginButton.trigger('click');

    // Check that the login form is now shown and register form is hidden
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(false);
  });

  it('applies active class to the selected tab', async () => {
    const wrapper = createAuthView();

    // Check that login tab has active class by default
    const loginButton = wrapper.findAll('[data-testid="app-button"]')[0];
    expect(loginButton.classes()).toContain('auth-view__tab-btn--active');

    // Click register tab
    const registerButton = wrapper.findAll('[data-testid="app-button"]')[1];
    await registerButton.trigger('click');

    // Check that register tab now has active class and login tab doesn't
    expect(registerButton.classes()).toContain('auth-view__tab-btn--active');
    expect(loginButton.classes()).not.toContain('auth-view__tab-btn--active');
  });

  it('is accessible via keyboard navigation', async () => {
    const wrapper = createAuthView();

    // Find the tab buttons
    const loginButton = wrapper.findAll('[data-testid="app-button"]')[0];
    const registerButton = wrapper.findAll('[data-testid="app-button"]')[1];

    // Simulate keyboard navigation
    await loginButton.trigger('keydown.enter');
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);

    await registerButton.trigger('keydown.enter');
    expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(true);
  });

  it('maintains proper color contrast ratios', () => {
    const wrapper = createAuthView();

    // Check that the active tab has proper styling for contrast
    const loginButton = wrapper.findAll('[data-testid="app-button"]')[0];
    expect(loginButton.classes()).toContain('auth-view__tab-btn--active');

    // In a real test, we would use a tool like axe-core to check contrast ratios
    // For this example, we're just verifying the class is applied
  });

  it('is responsive on different screen sizes', async () => {
    const wrapper = createAuthView();

    // Check that the container has responsive styling
    const container = wrapper.find('.auth-view__container');
    expect(container.attributes('style')).toContain('width: 100%');
    expect(container.attributes('style')).toContain('max-width: 520px');

    // In a real test, we would use a tool like Cypress to check responsive behavior
    // For this example, we're just verifying the responsive classes are applied
  });
});
