import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'
import { ButtonVariantEnum } from '@/types/button'

/**
 * E2E tests for the Button component
 * These tests verify that the component works correctly in a real-world scenario
 */
describe('Button E2E', () => {
  it('renders correctly in a real-world scenario', () => {
    // Mount the component with real-world props
    const wrapper = mount(Button, {
      props: {
        variant: ButtonVariantEnum.PRIMARY,
        disabled: false,
        to: undefined,
        ariaLabel: 'Real World Button'
      },
      slots: {
        default: 'Click Me'
      }
    })

    // Verify that the component renders correctly
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Click Me')
    expect(wrapper.classes()).toContain('button--primary')
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('aria-label')).toBe('Real World Button')
  })

  it('works correctly with keyboard navigation', async () => {
    // Mount the component
    const wrapper = mount(Button, {
      props: {
        variant: ButtonVariantEnum.PRIMARY,
        disabled: false
      },
      slots: {
        default: 'Keyboard Button'
      }
    })

    // Verify that the component is focusable
    wrapper.element.focus()
    expect(document.activeElement).toBe(wrapper.element)

    // Verify that the component responds to keyboard events
    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('is accessible to screen readers', () => {
    // Mount the component
    const wrapper = mount(Button, {
      props: {
        variant: ButtonVariantEnum.PRIMARY,
        disabled: false,
        ariaLabel: 'Screen Reader Button'
      }
    })

    // Verify that the component has the correct role and aria attributes
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('aria-label')).toBe('Screen Reader Button')
  })

  it('works correctly as a router link', () => {
    // Mount the component as a router link
    const wrapper = mount(Button, {
      props: {
        variant: ButtonVariantEnum.SECONDARY,
        to: '/test-path'
      },
      global: {
        stubs: {
          'router-link': true
        }
      }
    })

    // Verify that the component renders as a router link
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('to')).toBe('/test-path')
    expect(wrapper.classes()).toContain('button--secondary')
  })
}) 