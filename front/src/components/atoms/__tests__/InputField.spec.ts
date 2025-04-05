import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputField from '../InputField.vue'

describe('InputField', () => {
  it('renders properly with required props', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
      },
    })

    expect(wrapper.find('label').text()).toBe('Test Label')
    expect(wrapper.find('input').attributes('id')).toBe('test-input')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
      },
    })

    await wrapper.find('input').setValue('test value')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
  })

  it('shows error message when error prop is provided', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        error: 'Test error message',
      },
    })

    expect(wrapper.find('.input-field__error').text()).toBe('Test error message')
  })

  it('applies error class when error is present', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        error: 'Test error message',
      },
    })

    expect(wrapper.find('.input-field').classes()).toContain('input-field--error')
  })

  it('sets aria-invalid when error is present', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        error: 'Test error message',
      },
    })

    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby when error is present', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        error: 'Test error message',
      },
    })

    expect(wrapper.find('input').attributes('aria-describedby')).toBe('test-input-error')
  })

  it('applies custom class when className prop is provided', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        className: 'custom-class',
      },
    })

    expect(wrapper.find('.input-field').classes()).toContain('custom-class')
  })

  it('handles disabled state correctly', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        disabled: true,
      },
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('handles required state correctly', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        required: true,
      },
    })

    expect(wrapper.find('input').attributes('required')).toBeDefined()
  })
}) 