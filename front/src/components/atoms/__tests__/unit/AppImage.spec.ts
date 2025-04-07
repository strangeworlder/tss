// Unit tests for AppImage component
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AppImage from '../../AppImage.vue'
import { ImageSizeEnum, ImageFormatEnum } from '@/types/image'
import { mockImageService } from '../__mocks__/imageService.mock'

// Mock the image service
vi.mock('@/api/imageService', () => ({
  getImageUrl: mockImageService.getImageUrl,
}))

describe('AppImage', () => {
  const defaultProps = {
    filename: 'test-image.jpg',
    alt: 'Test image',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with default props', () => {
      const wrapper = mount(AppImage, {
        props: defaultProps,
      })

      expect(wrapper.classes()).toContain('image-component')
      expect(wrapper.attributes('alt')).toBe('Test image')
      expect(wrapper.attributes('loading')).toBe('lazy')
    })

    it('should render with custom size and format', () => {
      const wrapper = mount(AppImage, {
        props: {
          ...defaultProps,
          size: ImageSizeEnum.MEDIUM,
          format: ImageFormatEnum.WEBP,
        },
      })

      expect(mockImageService.getImageUrl).toHaveBeenCalledWith(
        'test-image.jpg',
        ImageSizeEnum.MEDIUM,
        ImageFormatEnum.WEBP,
      )
    })

    it('should render with custom dimensions', () => {
      const wrapper = mount(AppImage, {
        props: {
          ...defaultProps,
          width: 300,
          height: 200,
        },
      })

      expect(wrapper.attributes('width')).toBe('300')
      expect(wrapper.attributes('height')).toBe('200')
    })
  })

  describe('error handling', () => {
    it('should show fallback image on error', async () => {
      const wrapper = mount(AppImage, {
        props: defaultProps,
      })

      await wrapper.trigger('error')

      expect(wrapper.classes()).toContain('image-component--error')
      expect(wrapper.attributes('src')).toBe('/images/placeholder.webp')
    })

    it('should use custom fallback image when provided', async () => {
      const wrapper = mount(AppImage, {
        props: {
          ...defaultProps,
          fallback: '/images/custom-fallback.jpg',
        },
      })

      await wrapper.trigger('error')

      expect(wrapper.attributes('src')).toBe('/images/custom-fallback.jpg')
    })
  })

  describe('accessibility', () => {
    it('should have proper aria attributes', () => {
      const wrapper = mount(AppImage, {
        props: {
          ...defaultProps,
          ariaLabel: 'Custom aria label',
        },
      })

      expect(wrapper.attributes('aria-label')).toBe('Custom aria label')
    })

    it('should fallback to alt text for aria-label', () => {
      const wrapper = mount(AppImage, {
        props: defaultProps,
      })

      expect(wrapper.attributes('aria-label')).toBe('Test image')
    })
  })

  describe('lazy loading', () => {
    it('should support eager loading when lazy is false', () => {
      const wrapper = mount(AppImage, {
        props: {
          ...defaultProps,
          lazy: false,
        },
      })

      expect(wrapper.attributes('loading')).toBe('eager')
    })
  })
})
