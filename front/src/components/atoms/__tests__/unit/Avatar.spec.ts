import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Avatar from '../../Avatar.vue';
import { ImageSizeEnum, ImageFormatEnum } from '@/types/image';
import { mockImageService } from '../__mocks__/imageService.mock';

// Mock the image service
vi.mock('@/api/imageService', () => ({
  getImageUrl: mockImageService.getImageUrl,
}));

describe('Avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with default props', () => {
      const wrapper = mount(Avatar, {
        props: {
          alt: 'User avatar',
        },
      });

      expect(wrapper.classes()).toContain('avatar');
      expect(wrapper.classes()).toContain('avatar--md');
      expect(wrapper.find('.avatar__image').exists()).toBe(true);
      expect(mockImageService.getImageUrl).toHaveBeenCalledWith(
        'placeholder1.webp',
        ImageSizeEnum.MEDIUM,
        ImageFormatEnum.WEBP
      );
    });

    it('should render avatar image when src is provided', () => {
      const wrapper = mount(Avatar, {
        props: {
          alt: 'User avatar',
          src: 'profile.jpg',
        },
      });

      expect(wrapper.find('.avatar__image').exists()).toBe(true);
      expect(mockImageService.getImageUrl).toHaveBeenCalledWith(
        'profile.jpg',
        ImageSizeEnum.MEDIUM,
        ImageFormatEnum.WEBP
      );
    });

    it('should render with different sizes', () => {
      const small = mount(Avatar, {
        props: {
          alt: 'User avatar',
          size: 'sm',
        },
      });

      const large = mount(Avatar, {
        props: {
          alt: 'User avatar',
          size: 'lg',
        },
      });

      expect(small.classes()).toContain('avatar--sm');
      expect(large.classes()).toContain('avatar--lg');
    });
  });

  describe('error handling', () => {
    it('should show placeholder when image fails to load', async () => {
      const wrapper = mount(Avatar, {
        props: {
          alt: 'User avatar',
          src: 'profile.jpg',
        },
      });

      // Initially shows image
      expect(wrapper.find('.avatar__image').exists()).toBe(true);

      // Trigger error
      await wrapper.find('.avatar__image').trigger('error');

      // Should now show placeholder
      expect(wrapper.find('.avatar__image').exists()).toBe(true);
      expect(wrapper.find('.avatar__image--placeholder').exists()).toBe(true);
      expect(wrapper.classes()).toContain('avatar--error');
      expect(mockImageService.getImageUrl).toHaveBeenCalledWith(
        'placeholder1.webp',
        ImageSizeEnum.MEDIUM,
        ImageFormatEnum.WEBP
      );
    });
  });
});
