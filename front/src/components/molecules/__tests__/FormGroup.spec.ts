import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormGroup from '../FormGroup.vue'

describe('FormGroup', () => {
  it('renders properly with required props', () => {
    const wrapper = mount(FormGroup, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
      },
    })

    expect(wrapper.find('.form-group').exists()).toBe(true)
  })

  it('passes props correctly to InputField', () => {
    const wrapper = mount(FormGroup, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: 'test value',
        error: 'Test error',
        required: true,
        disabled: true,
        placeholder: 'Test placeholder',
      },
    })

    const inputField = wrapper.findComponent({ name: 'InputField' })
    expect(inputField.props()).toEqual({
      id: 'test-input',
      label: 'Test Label',
      modelValue: 'test value',
      error: 'Test error',
      required: true,
      disabled: true,
      placeholder: 'Test placeholder',
      type: 'text',
      className: '',
    })
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(FormGroup, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
      },
    })

    await wrapper.findComponent({ name: 'InputField' }).vm.$emit('update:modelValue', 'new value')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
  })

  it('applies custom class when className prop is provided', () => {
    const wrapper = mount(FormGroup, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        modelValue: '',
        className: 'custom-class',
      },
    })

    expect(wrapper.find('.form-group').classes()).toContain('custom-class')
  })
}) 