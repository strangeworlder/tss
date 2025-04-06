import type { IFormFieldProps } from '@/types/form'

/**
 * Creates a default set of props for the FormGroup component
 * @param overrides - Props to override the defaults
 * @returns The props for the FormGroup component
 */
export function createFormGroupProps(overrides = {}): IFormFieldProps {
  return {
    id: 'test-input',
    label: 'Test Label',
    modelValue: '',
    ...overrides
  }
}

/**
 * Mock data for FormGroup component tests
 */
export const mockFormGroups = {
  default: createFormGroupProps(),
  withError: createFormGroupProps({
    error: 'This field is required'
  }),
  required: createFormGroupProps({
    required: true
  }),
  disabled: createFormGroupProps({
    disabled: true
  }),
  withPlaceholder: createFormGroupProps({
    placeholder: 'Enter your text here'
  }),
  withCustomClass: createFormGroupProps({
    className: 'custom-class'
  }),
  withValue: createFormGroupProps({
    modelValue: 'test value'
  }),
  emailType: createFormGroupProps({
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email'
  }),
  passwordType: createFormGroupProps({
    id: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password'
  })
} 