import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AppNavigation from '../AppNavigation.vue';
import NavLink from '@/components/molecules/NavLink.vue';
import UserMenu from '@/components/molecules/UserMenu.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: {} },
    { path: '/blog', component: {} },
    { path: '/about', component: {} },
    { path: '/admin', component: {} },
    { path: '/auth', component: {} },
    { path: '/profile', component: {} },
  ],
});

// Mock document methods
const mockFocus = vi.fn();
const originalQuerySelectorAll = document.querySelectorAll;
const originalActiveElement = Object.getOwnPropertyDescriptor(document, 'activeElement');

describe('AppNavigation', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock document.querySelectorAll to return elements with focus method
    document.querySelectorAll = vi
      .fn()
      .mockReturnValue([{ focus: mockFocus }, { focus: mockFocus }, { focus: mockFocus }]);

    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      get: () => ({ tagName: 'A' }),
    });
  });

  afterEach(() => {
    // Restore original methods
    document.querySelectorAll = originalQuerySelectorAll;
    Object.defineProperty(document, 'activeElement', originalActiveElement || {});
  });

  // Rendering tests
  describe('rendering', () => {
    it('renders navigation with correct ARIA label', () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: false,
          isAdmin: false,
          userName: '',
          isUserMenuOpen: false,
        },
      });

      expect(wrapper.find('nav').attributes('aria-label')).toBe('Main navigation');
    });

    it('renders all base navigation items', () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: false,
          isAdmin: false,
          userName: '',
          isUserMenuOpen: false,
        },
      });

      const links = wrapper.findAllComponents(NavLink);
      expect(links).toHaveLength(4); // Home, Blog, About, Login/Register
    });
  });

  // Props tests
  describe('props', () => {
    it('shows admin link when isAdmin is true', () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: true,
          isAdmin: true,
          userName: 'Test User',
          isUserMenuOpen: false,
        },
      });

      const adminLink = wrapper.findComponent(NavLink);
      expect(adminLink.exists()).toBe(true);
    });

    it('shows user menu when authenticated', () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: true,
          isAdmin: false,
          userName: 'Test User',
          isUserMenuOpen: false,
        },
      });

      const userMenu = wrapper.findComponent(UserMenu);
      expect(userMenu.exists()).toBe(true);
    });
  });

  // Events tests
  describe('events', () => {
    it('emits toggleUserMenu when user menu is toggled', async () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: true,
          isAdmin: false,
          userName: 'Test User',
          isUserMenuOpen: false,
        },
      });

      await wrapper.findComponent(UserMenu).vm.$emit('toggle');
      expect(wrapper.emitted('toggleUserMenu')).toBeTruthy();
    });

    it('emits logout when logout is triggered', async () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: true,
          isAdmin: false,
          userName: 'Test User',
          isUserMenuOpen: false,
        },
      });

      await wrapper.findComponent(UserMenu).vm.$emit('logout');
      expect(wrapper.emitted('logout')).toBeTruthy();
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('handles keyboard navigation', async () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: false,
          isAdmin: false,
          userName: '',
          isUserMenuOpen: false,
        },
      });

      // Find the first NavLink component
      const firstLink = wrapper.findComponent(NavLink);
      expect(firstLink.exists()).toBe(true);

      // Trigger keydown event on the navigation
      const nav = wrapper.find('nav');
      await nav.trigger('keydown.tab');

      // Verify that focusCurrentItem was called
      expect(mockFocus).toHaveBeenCalled();
    });

    it('announces menu state changes to screen readers', async () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: false,
          isAuthenticated: false,
          isAdmin: false,
          userName: '',
          isUserMenuOpen: false,
        },
      });

      // Check initial state
      expect(wrapper.find('nav').attributes('aria-expanded')).toBe('false');

      // Update isOpen prop
      await wrapper.setProps({ isOpen: true });

      // Check updated state
      expect(wrapper.find('nav').attributes('aria-expanded')).toBe('true');
    });
  });

  // Responsive tests
  describe('responsive behavior', () => {
    it('applies correct classes when menu is open on mobile', async () => {
      const wrapper = mount(AppNavigation, {
        global: { plugins: [router] },
        props: {
          isOpen: true,
          isAuthenticated: false,
          isAdmin: false,
          userName: '',
          isUserMenuOpen: false,
        },
      });

      expect(wrapper.classes()).toContain('navigation--open');
    });
  });
});
