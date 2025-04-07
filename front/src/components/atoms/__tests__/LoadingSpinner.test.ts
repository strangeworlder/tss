import { describe, it, expect } from 'vitest';
import { mountLoadingSpinner } from './LoadingSpinner.test-utils';
import { mockLoadingSpinners } from './__fixtures__/LoadingSpinner.fixture';

describe('LoadingSpinner', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountLoadingSpinner();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('loading-spinner--md');
    expect(wrapper.find('.loading-spinner__text').text()).toBe('Loading...');
  });

  it('renders correctly with small size', () => {
    const wrapper = mountLoadingSpinner(mockLoadingSpinners.small);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('loading-spinner--sm');
  });

  it('renders correctly with medium size', () => {
    const wrapper = mountLoadingSpinner(mockLoadingSpinners.medium);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('loading-spinner--md');
  });

  it('renders correctly with large size', () => {
    const wrapper = mountLoadingSpinner(mockLoadingSpinners.large);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('loading-spinner--lg');
  });

  it('renders with custom text', () => {
    const wrapper = mountLoadingSpinner(mockLoadingSpinners.customText);
    expect(wrapper.find('.loading-spinner__text').text()).toBe('Processing data...');
    expect(wrapper.find('.sr-only').text()).toBe('Processing data...');
  });

  it('does not render text element when text is empty', () => {
    const wrapper = mountLoadingSpinner(mockLoadingSpinners.noText);
    expect(wrapper.find('.loading-spinner__text').exists()).toBe(false);
    expect(wrapper.find('.sr-only').text()).toBe('Loading');
  });

  it('has appropriate accessibility attributes', () => {
    const wrapper = mountLoadingSpinner();
    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-live')).toBe('polite');
    expect(wrapper.find('.loading-spinner__spinner').attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.sr-only').exists()).toBe(true);
  });
});
