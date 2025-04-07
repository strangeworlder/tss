import { describe, it, expect } from 'vitest';
import { mountAuthorInfo } from './AuthorInfo.test-utils';
import { mockAuthorInfos } from '@/components/molecules/__tests__/__fixtures__/AuthorInfo.fixture';
import Avatar from '@/components/atoms/Avatar.vue';
import type { Props } from '../AuthorInfo.types';

describe('AuthorInfo', () => {
  // 1. Rendering tests
  it('renders author name and avatar correctly', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    expect(wrapper.find('.author-info__name').text()).toBe('John Doe');
    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.exists()).toBe(true);
    expect(avatar.props('src')).toBe('avatar.jpg');
    expect(avatar.props('alt')).toBe('John Doe');
  });

  it('displays Anonymous when no author is provided', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.noAuthor);

    expect(wrapper.find('.author-info__name').text()).toBe('Anonymous');
  });

  it('displays date when provided', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    const dateElement = wrapper.find('.author-info__date');
    expect(dateElement.exists()).toBe(true);
    expect(dateElement.attributes('datetime')).toBe('2024-03-20');
  });

  it('does not display date when not provided', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.noDate);

    expect(wrapper.find('.author-info__date').exists()).toBe(false);
  });

  // 2. Props tests
  it('applies correct size class to avatar', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.largeSize);

    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.props('size')).toBe('lg');
  });

  it('uses default size when not provided', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.props('size')).toBe('md');
  });

  it('accepts valid size values', () => {
    const sizes: Props['size'][] = ['sm', 'md', 'lg'];

    for (const size of sizes) {
      const props: Props = {
        ...mockAuthorInfos.default,
        size,
      };
      const wrapper = mountAuthorInfo(props);
      const avatar = wrapper.findComponent(Avatar);
      expect(avatar.props('size')).toBe(size);
    }
  });

  it('handles missing avatar gracefully', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.authorWithoutAvatar);

    expect(wrapper.find('.author-info__name').text()).toBe('John Doe');
    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.exists()).toBe(true);
  });

  // 3. Accessibility tests
  it('uses semantic time element for dates', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    const timeElement = wrapper.find('time');
    expect(timeElement.exists()).toBe(true);
    expect(timeElement.attributes('datetime')).toBe('2024-03-20');
  });

  it('provides meaningful alt text for avatar', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.props('alt')).toBe('John Doe');
  });

  it('provides fallback alt text when author name is missing', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.authorWithoutName);

    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.props('alt')).toBe('Anonymous');
  });

  it('maintains proper heading hierarchy', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    expect(wrapper.find('h1, h2, h3, h4, h5, h6').exists()).toBe(false);
  });

  it('has no redundant ARIA attributes', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    const elements = wrapper.findAll('[aria-*]');
    expect(elements.length).toBe(0);
  });

  // 4. Date formatting tests
  it('formats date correctly', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    const formattedDate = wrapper.find('.author-info__date').text();
    expect(formattedDate).toBe('March 20, 2024');
  });

  it('handles invalid date gracefully', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.invalidDate);

    const dateElement = wrapper.find('.author-info__date');
    expect(dateElement.exists()).toBe(true);
    expect(dateElement.text()).toBe('');
  });

  // 5. Styling tests
  it('has correct CSS classes and styling', () => {
    const wrapper = mountAuthorInfo(mockAuthorInfos.default);

    // Check if the main container has the correct class
    const mainContainer = wrapper.find('.author-info');
    expect(mainContainer.exists()).toBe(true);

    // Check if the details have the correct class
    const details = wrapper.find('.author-info__details');
    expect(details.exists()).toBe(true);

    // Check if the name has the correct class
    const name = wrapper.find('.author-info__name');
    expect(name.exists()).toBe(true);

    // Check if the date has the correct class
    const date = wrapper.find('.author-info__date');
    expect(date.exists()).toBe(true);
  });
});
