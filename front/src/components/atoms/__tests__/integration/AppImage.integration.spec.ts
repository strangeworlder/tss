// Integration tests for AppImage component with other atoms 
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AppImage from '../../AppImage.vue'
import { ImageSizeEnum, ImageFormatEnum } from '@/types/image'
import { mockImageService } from '../__mocks__/imageService.mock'

// Mock the image service
vi.mock('@/api/imageService', () => ({
  getImageUrl: mockImageService.getImageUrl
}))

describe('AppImage Integration', () => {
  const defaultProps = {
    filename: 'test-image.jpg',
    alt: 'Test image',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('integration with other components', () => {
    it('should work with custom class names from parent components', () => {
      const wrapper = mount(AppImage, {
        props: {
          ...defaultProps,
          className: 'custom-class',
        },
      })

      expect(wrapper.classes()).toContain('image-component')
      expect(wrapper.classes()).toContain('custom-class')
    })

    it('should handle error state with custom styling', async () => {
      const wrapper = mount(AppImage, {
        props: defaultProps,
      })

      await wrapper.trigger('error')
      
      expect(wrapper.classes()).toContain('image-component--error')
      expect(wrapper.attributes('src')).toBe('/images/placeholder.webp')
    })
  })

  describe('responsive behavior', () => {
    it('should adapt to different screen sizes', () => {
      const wrapper = mount(AppImage, {
        props: defaultProps,
      })

      const img = wrapper.element as HTMLImageElement
      expect(img.style.maxWidth).toBe('100%')
      expect(img.style.height).toBe('auto')
    })
  })

  describe('performance', () => {
    it('should use lazy loading by default', () => {
      const wrapper = mount(AppImage, {
        props: defaultProps,
      })

      expect(wrapper.attributes('loading')).toBe('lazy')
    })

    it('should use eager loading when specified', () => {
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