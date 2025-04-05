/**
 * Base interface for form field props
 */
export interface IFormFieldProps {
  /**
   * Unique identifier for the input
   */
  id: string
  /**
   * Label text for the input
   */
  label: string
  /**
   * Input type (text, email, password, etc.)
   */
  type?: string
  /**
   * v-model value
   */
  modelValue: string
  /**
   * Error message to display
   */
  error?: string
  /**
   * Whether the input is required
   */
  required?: boolean
  /**
   * Placeholder text
   */
  placeholder?: string
  /**
   * Whether the input is disabled
   */
  disabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Base interface for form error props
 */
export interface IFormErrorProps {
  /**
   * Error message to display
   */
  message?: string
  /**
   * Additional CSS classes
   */
  className?: string
} 