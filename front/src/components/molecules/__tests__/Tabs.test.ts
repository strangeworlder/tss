import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Tabs from '../Tabs.vue';

describe('Tabs', () => {
  const mockTabs = [
    { value: 'tab1', label: 'Tab 1' },
    { value: 'tab2', label: 'Tab 2' },
    { value: 'tab3', label: 'Tab 3' },
  ];

  it('renders correctly', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'tab1',
        tabs: mockTabs,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.tabs').exists()).toBe(true);
    expect(wrapper.findAll('.tabs__tab')).toHaveLength(3);
  });

  it('renders the correct tab labels', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'tab1',
        tabs: mockTabs,
      },
    });

    const tabLabels = wrapper.findAll('.tabs__tab').map((tab) => tab.text());
    expect(tabLabels).toEqual(['Tab 1', 'Tab 2', 'Tab 3']);
  });

  it('marks the active tab correctly', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'tab2',
        tabs: mockTabs,
      },
    });

    const tabs = wrapper.findAll('.tabs__tab');
    expect(tabs[0].classes()).not.toContain('tabs__tab--active');
    expect(tabs[1].classes()).toContain('tabs__tab--active');
    expect(tabs[2].classes()).not.toContain('tabs__tab--active');
  });

  it('emits update:modelValue when a tab is clicked', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'tab1',
        tabs: mockTabs,
      },
    });

    await wrapper.findAll('.tabs__tab')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tab2']);
  });

  it('applies the fullWidth class when fullWidth prop is true', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'tab1',
        tabs: mockTabs,
        fullWidth: true,
      },
    });

    expect(wrapper.find('.tabs--full-width').exists()).toBe(true);
  });

  it('applies the correct variant class', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'tab1',
        tabs: mockTabs,
        variant: 'pills',
      },
    });

    expect(wrapper.find('.tabs--pills').exists()).toBe(true);
  });

  it('sets the correct ARIA attributes for accessibility', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'tab2',
        tabs: mockTabs,
      },
    });

    const tabs = wrapper.findAll('.tabs__tab');
    expect(tabs[0].attributes('aria-selected')).toBe('false');
    expect(tabs[1].attributes('aria-selected')).toBe('true');
    expect(tabs[2].attributes('aria-selected')).toBe('false');

    expect(tabs[0].attributes('tabindex')).toBe('-1');
    expect(tabs[1].attributes('tabindex')).toBe('0');
    expect(tabs[2].attributes('tabindex')).toBe('-1');
  });
});
