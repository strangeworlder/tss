import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountBackButton, clickBackButton, pressEnterOnBackButton, getButtonText, wasRouterPushCalledWith } from '../BackButton.test-utils'
import { mockBackButtons } from '../__fixtures__/BackButton.fixture'

describe('BackButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with default props', () => {
      const wrapper = mountBackButton()
      
      expect(wrapper.classes()).toContain('back-button')
      expect(getButtonText(wrapper)).toBe('← Back')
    })

    it('should render with custom text', () => {
      const wrapper = mountBackButton(mockBackButtons.customText)
      
      expect(getButtonText(wrapper)).toBe('← Return to Home')
    })
  })

  describe('navigation', () => {
    it('should navigate to default path when clicked', async () => {
      const wrapper = mountBackButton()
      
      await clickBackButton(wrapper)
      
      expect(wasRouterPushCalledWith(wrapper, '/')).toBe(true)
    })

    it('should navigate to custom path when clicked', async () => {
      const wrapper = mountBackButton(mockBackButtons.customPath)
      
      await clickBackButton(wrapper)
      
      expect(wasRouterPushCalledWith(wrapper, '/dashboard')).toBe(true)
    })

    it('should navigate when Enter key is pressed', async () => {
      const wrapper = mountBackButton(mockBackButtons.customBoth)
      
      await pressEnterOnBackButton(wrapper)
      
      expect(wasRouterPushCalledWith(wrapper, '/profile')).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      const wrapper = mountBackButton(mockBackButtons.customText)
      
      expect(wrapper.find('.back-button').attributes('aria-label')).toBe('Return to Home button')
    })

    it('should have proper role attribute', () => {
      const wrapper = mountBackButton()
      
      expect(wrapper.find('.back-button').attributes('role')).toBe('button')
    })

    it('should be keyboard focusable', () => {
      const wrapper = mountBackButton()
      
      expect(wrapper.find('.back-button').attributes('tabindex')).toBe('0')
    })
  })
}) 