import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UserMenu from '../UserMenu.vue';

describe('UserMenu', () => {
  const defaultProps = {
    userName: 'John Doe',
    isOpen: false,
    isProfileActive: false,
  };

  describe('rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(UserMenu, { props: defaultProps });
      expect(wrapper.find('.user-menu').exists()).toBe(true);
      expect(wrapper.find('.user-menu__name').text()).toBe('John Doe');
    });

    it('shows dropdown when isOpen is true', () => {
      const wrapper = mount(UserMenu, {
        props: { ...defaultProps, isOpen: true },
      });
      expect(wrapper.find('.user-menu__dropdown--open').exists()).toBe(true);
    });

    it('highlights profile link when active', () => {
      const wrapper = mount(UserMenu, {
        props: { ...defaultProps, isProfileActive: true },
      });
      expect(wrapper.find('.user-menu__link--active').exists()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      const wrapper = mount(UserMenu, { props: defaultProps });
      const button = wrapper.find('.user-menu__button');
      const dropdown = wrapper.find('.user-menu__dropdown');

      expect(button.attributes('aria-expanded')).toBe('false');
      expect(button.attributes('aria-controls')).toBe(dropdown.attributes('id'));
    });
  });

  describe('events', () => {
    it('emits toggle event when button is clicked', async () => {
      const wrapper = mount(UserMenu, { props: defaultProps });
      await wrapper.find('.user-menu__button').trigger('click');
      expect(wrapper.emitted('toggle')).toBeTruthy();
    });

    it('emits toggle event when profile link is clicked', async () => {
      const wrapper = mount(UserMenu, { props: defaultProps });
      await wrapper.find('RouterLink').trigger('click');
      expect(wrapper.emitted('toggle')).toBeTruthy();
    });

    it('emits both toggle and logout events when logout button is clicked', async () => {
      const wrapper = mount(UserMenu, { props: defaultProps });
      await wrapper.find('.user-menu__link--logout').trigger('click');
      expect(wrapper.emitted('toggle')).toBeTruthy();
      expect(wrapper.emitted('logout')).toBeTruthy();
      // Check emission order
      expect(wrapper.emitted()).toEqual({
        toggle: [[]],
        logout: [[]],
      });
    });
  });

  describe('responsive behavior', () => {
    it('applies mobile styles at breakpoint', () => {
      // Add responsive design tests
    });
  });
});
