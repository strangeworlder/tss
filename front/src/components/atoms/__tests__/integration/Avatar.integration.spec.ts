import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Avatar from '../../Avatar.vue'
import { mockImageService } from '../__mocks__/imageService.mock'

// Mock the image service
vi.mock('@/api/imageService', () => ({
  getImageUrl: mockImageService.getImageUrl,
}))

describe('Avatar Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('integration with parent components', () => {
    it('should work in a container with multiple avatars', () => {
      // Create a wrapper component that contains multiple avatars
      const TestContainer = {
        components: { Avatar },
        template: `
          <div class="avatar-container">
            <Avatar 
              alt="User 1" 
              src="user1.jpg" 
              size="sm"
              class="custom-avatar"
            />
            <Avatar 
              alt="User 2" 
              size="md"
            />
          </div>
        `,
      }

      const wrapper = mount(TestContainer)

      // Check if both avatars are rendered
      const avatars = wrapper.findAllComponents(Avatar)
      expect(avatars.length).toBe(2)

      // Check if the first avatar has the custom class
      expect(avatars[0].classes()).toContain('custom-avatar')

      // Check if sizes are applied correctly
      expect(avatars[0].classes()).toContain('avatar--sm')
      expect(avatars[1].classes()).toContain('avatar--md')

      // Check if placeholder is used for the second avatar
      expect(mockImageService.getImageUrl).toHaveBeenCalledWith(
        'placeholder1.webp',
        expect.any(String),
        expect.any(String),
      )
    })
  })

  describe('accessibility', () => {
    it('should be accessible with proper alt text', () => {
      const wrapper = mount(Avatar, {
        props: {
          alt: 'User profile picture',
          src: 'profile.jpg',
        },
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('User profile picture')
    })
  })

  describe('responsive behavior', () => {
    it('should handle different sizes appropriately', () => {
      // Small
      const smallAvatar = mount(Avatar, {
        props: {
          alt: 'Small avatar',
          size: 'sm',
        },
      })

      // Medium
      const mediumAvatar = mount(Avatar, {
        props: {
          alt: 'Medium avatar',
          size: 'md',
        },
      })

      // Large
      const largeAvatar = mount(Avatar, {
        props: {
          alt: 'Large avatar',
          size: 'lg',
        },
      })

      // Check if the classes are correctly applied
      expect(smallAvatar.classes()).toContain('avatar--sm')
      expect(mediumAvatar.classes()).toContain('avatar--md')
      expect(largeAvatar.classes()).toContain('avatar--lg')

      // Check if the dimensions follow a progression
      const smallElement = smallAvatar.element as HTMLElement
      const mediumElement = mediumAvatar.element as HTMLElement
      const largeElement = largeAvatar.element as HTMLElement

      expect(window.getComputedStyle(smallElement).width).toBe(
        getComputedStyle(document.documentElement).getPropertyValue('--spacing-xl'),
      )

      expect(window.getComputedStyle(mediumElement).width).toBe(
        getComputedStyle(document.documentElement).getPropertyValue('--spacing-2xl'),
      )

      expect(window.getComputedStyle(largeElement).width).toBe(
        getComputedStyle(document.documentElement).getPropertyValue('--spacing-3xl'),
      )
    })
  })
})
