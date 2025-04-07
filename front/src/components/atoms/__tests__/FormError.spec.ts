import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormError from '../FormError.vue'

describe('FormError', () => {
  it('renders error message when provided', () => {
    const wrapper = mount(FormError, {
      props: {
        message: 'Test error message',
      },
    })

    expect(wrapper.text()).toBe('Test error message')
  })

  it('does not render when message is empty', () => {
    const wrapper = mount(FormError, {
      props: {
        message: '',
      },
    })

    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('applies custom class when className prop is provided', () => {
    const wrapper = mount(FormError, {
      props: {
        message: 'Test error message',
        className: 'custom-class',
      },
    })

    expect(wrapper.find('p').classes()).toContain('custom-class')
  })

  it('has role="alert" for accessibility', () => {
    const wrapper = mount(FormError, {
      props: {
        message: 'Test error message',
      },
    })

    expect(wrapper.find('p').attributes('role')).toBe('alert')
  })
})
