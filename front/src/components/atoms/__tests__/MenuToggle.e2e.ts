import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp, ref } from 'vue';
import MenuToggle from '../MenuToggle.vue';

describe('MenuToggle E2E', () => {
  it('toggles menu visibility when clicked', async () => {
    // Create a test app with the MenuToggle component
    const app = createApp({
      template: `
        <div>
          <MenuToggle :is-open="isMenuOpen" @toggle="toggleMenu" />
          <nav v-show="isMenuOpen" data-testid="menu">
            <ul>
              <li>Menu Item 1</li>
              <li>Menu Item 2</li>
            </ul>
          </nav>
        </div>
      `,
      setup() {
        const isMenuOpen = ref(false);
        const toggleMenu = () => {
          isMenuOpen.value = !isMenuOpen.value;
        };
        return { isMenuOpen, toggleMenu };
      },
    });

    app.component('MenuToggle', MenuToggle);

    // Mount the app
    const wrapper = mount(app);

    // Check that the menu is initially hidden
    expect(wrapper.find('[data-testid="menu"]').isVisible()).toBe(false);

    // Click the menu toggle
    await wrapper.find('.menu-toggle').trigger('click');

    // Check that the menu is now visible
    expect(wrapper.find('[data-testid="menu"]').isVisible()).toBe(true);

    // Click the menu toggle again
    await wrapper.find('.menu-toggle').trigger('click');

    // Check that the menu is hidden again
    expect(wrapper.find('[data-testid="menu"]').isVisible()).toBe(false);
  });

  it('toggles menu visibility when using keyboard navigation', async () => {
    // Create a test app with the MenuToggle component
    const app = createApp({
      template: `
        <div>
          <MenuToggle :is-open="isMenuOpen" @toggle="toggleMenu" />
          <nav v-show="isMenuOpen" data-testid="menu">
            <ul>
              <li>Menu Item 1</li>
              <li>Menu Item 2</li>
            </ul>
          </nav>
        </div>
      `,
      setup() {
        const isMenuOpen = ref(false);
        const toggleMenu = () => {
          isMenuOpen.value = !isMenuOpen.value;
        };
        return { isMenuOpen, toggleMenu };
      },
    });

    app.component('MenuToggle', MenuToggle);

    // Mount the app
    const wrapper = mount(app);

    // Check that the menu is initially hidden
    expect(wrapper.find('[data-testid="menu"]').isVisible()).toBe(false);

    // Focus the menu toggle and press Enter
    await wrapper.find('.menu-toggle').trigger('focus');
    await wrapper.find('.menu-toggle').trigger('keydown.enter');

    // Check that the menu is now visible
    expect(wrapper.find('[data-testid="menu"]').isVisible()).toBe(true);

    // Press Enter again
    await wrapper.find('.menu-toggle').trigger('keydown.enter');

    // Check that the menu is hidden again
    expect(wrapper.find('[data-testid="menu"]').isVisible()).toBe(false);
  });
});
