import { describe, it, expect } from 'vitest'
import { mountFormGroup } from './FormGroup.test-utils'
import { mockFormGroups } from '@/components/molecules/__tests__/__fixtures__/FormGroup.fixture'
import InputField from '@/components/atoms/InputField.vue'

describe('FormGroup', () => {
  // 1. Rendering tests
  it('renders properly with required props', () => {
    const wrapper = mountFormGroup(mockFormGroups.default)

    expect(wrapper.find('.form-group').exists()).toBe(true)
  })

  it('passes props correctly to InputField', () => {
    const wrapper = mountFormGroup({
      id: 'test-input',
      label: 'Test Label',
      modelValue: 'test value',
      error: 'Test error',
      required: true,
      disabled: true,
      placeholder: 'Test placeholder',
    })

    const inputField = wrapper.findComponent(InputField)
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

  // 2. Props tests
  it('applies custom class when className prop is provided', () => {
    const wrapper = mountFormGroup(mockFormGroups.withCustomClass)

    expect(wrapper.find('.form-group').classes()).toContain('custom-class')
  })

  it('handles different input types correctly', () => {
    const emailWrapper = mountFormGroup(mockFormGroups.emailType)
    const passwordWrapper = mountFormGroup(mockFormGroups.passwordType)

    expect(emailWrapper.findComponent(InputField).props('type')).toBe('email')
    expect(passwordWrapper.findComponent(InputField).props('type')).toBe('password')
  })

  it('handles required prop correctly', () => {
    const wrapper = mountFormGroup(mockFormGroups.required)

    expect(wrapper.findComponent(InputField).props('required')).toBe(true)
  })

  it('handles disabled prop correctly', () => {
    const wrapper = mountFormGroup(mockFormGroups.disabled)

    expect(wrapper.findComponent(InputField).props('disabled')).toBe(true)
  })

  it('handles placeholder prop correctly', () => {
    const wrapper = mountFormGroup(mockFormGroups.withPlaceholder)

    expect(wrapper.findComponent(InputField).props('placeholder')).toBe('Enter your text here')
  })

  // 3. Event handling tests
  it('emits update:modelValue when input changes', async () => {
    const wrapper = mountFormGroup(mockFormGroups.default)

    await wrapper.findComponent(InputField).vm.$emit('update:modelValue', 'new value')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
  })

  // 4. Error handling tests
  it('displays error message when error prop is provided', () => {
    const wrapper = mountFormGroup(mockFormGroups.withError)

    expect(wrapper.findComponent(InputField).props('error')).toBe('This field is required')
  })

  // 5. Accessibility tests
  it('maintains proper form structure for accessibility', () => {
    const wrapper = mountFormGroup(mockFormGroups.default)

    // Check if the form group has the correct structure
    expect(wrapper.find('.form-group').exists()).toBe(true)

    // Check if the input field is properly labeled
    const inputField = wrapper.findComponent(InputField)
    expect(inputField.props('id')).toBe('test-input')
    expect(inputField.props('label')).toBe('Test Label')
  })

  // 6. Styling tests
  it('applies correct styling', () => {
    const wrapper = mountFormGroup(mockFormGroups.default)

    // Check if the form group has the correct class
    expect(wrapper.find('.form-group').exists()).toBe(true)

    // Check if the form group has the correct margin
    const formGroup = wrapper.find('.form-group')
    expect(getComputedStyle(formGroup.element).marginBottom).toBe('var(--spacing-4)')
  })
})
