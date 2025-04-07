import { describe, it, expect, vi } from 'vitest';
import { mountMenuToggle, createDefaultMenuToggleProps } from './MenuToggle.test-utils';
import { mockMenuToggles } from './__fixtures__/MenuToggle.fixture';

describe('MenuToggle', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountMenuToggle();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.classes()).toContain('menu-toggle');
  });

  it('renders correctly when open', () => {
    const wrapper = mountMenuToggle(mockMenuToggles.open);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('aria-expanded')).toBe('true');
  });

  it('renders correctly when closed', () => {
    const wrapper = mountMenuToggle(mockMenuToggles.default);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('aria-expanded')).toBe('false');
  });

  it('has the correct aria-label', () => {
    const wrapper = mountMenuToggle();
    expect(wrapper.attributes('aria-label')).toBe('Toggle menu');
  });

  it('emits toggle event when clicked', async () => {
    const wrapper = mountMenuToggle();
    await wrapper.trigger('click');
    expect(wrapper.emitted('toggle')).toBeTruthy();
  });

  it('emits toggle event when Enter key is pressed', async () => {
    const wrapper = mountMenuToggle();
    await wrapper.trigger('keydown.enter');
    expect(wrapper.emitted('toggle')).toBeTruthy();
  });

  it('emits toggle event when Space key is pressed', async () => {
    const wrapper = mountMenuToggle();
    await wrapper.trigger('keydown.space');
    expect(wrapper.emitted('toggle')).toBeTruthy();
  });
});
