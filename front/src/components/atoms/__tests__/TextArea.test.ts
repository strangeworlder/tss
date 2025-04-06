/**
 * TextArea Component Tests
 * 
 * Tests the TextArea component's functionality, accessibility, and error handling.
 * The component is a form input that allows multiline text entry with proper labeling
 * and error state management.
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TextArea from '../TextArea.vue'
import type { ITextAreaProps } from '@/types/form'

describe('TextArea', () => {
  const defaultProps: ITextAreaProps = {
    id: 'test-textarea',
    modelValue: '',
    label: 'Test Label'
  }

  it('renders with required props', () => {
    const wrapper = mount(TextArea, {
      props: defaultProps
    })

    expect(wrapper.find('label').text()).toBe('Test Label')
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('textarea').attributes('id')).toBe('test-textarea')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(TextArea, {
      props: defaultProps
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('New value')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['New value'])
  })

  it('displays error message when error prop is provided', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultProps,
        error: 'This field is required'
      }
    })

    expect(wrapper.find('.textarea-field__input--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('This field is required')
  })

  it('applies error class to textarea when error exists', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultProps,
        error: 'Error message'
      }
    })

    expect(wrapper.find('textarea').classes()).toContain('textarea-field__input--error')
  })

  it('sets aria-describedby when error exists', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultProps,
        error: 'Error message'
      }
    })

    expect(wrapper.find('textarea').attributes('aria-describedby')).toBe('test-textarea-error')
  })

  it('does not set aria-describedby when no error exists', () => {
    const wrapper = mount(TextArea, {
      props: defaultProps
    })

    expect(wrapper.find('textarea').attributes('aria-describedby')).toBeUndefined()
  })

  it('renders with custom rows value', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultProps,
        rows: 6
      }
    })

    expect(wrapper.find('textarea').attributes('rows')).toBe('6')
  })

  it('renders with placeholder text', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultProps,
        placeholder: 'Enter text here'
      }
    })

    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Enter text here')
  })

  it('maintains proper label-input association', () => {
    const wrapper = mount(TextArea, {
      props: defaultProps
    })

    const label = wrapper.find('label')
    const textarea = wrapper.find('textarea')

    expect(label.attributes('for')).toBe(defaultProps.id)
    expect(textarea.attributes('id')).toBe(defaultProps.id)
  })
}) 