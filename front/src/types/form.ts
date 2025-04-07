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
   * Unique identifier for the error
   */
  id: string
  /**
   * Error message to display
   */
  message?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

export interface ITextAreaProps {
  id: string
  modelValue: string
  label: string
  error?: string
  rows?: number
  placeholder?: string
}

export interface IInputFieldProps {
  id: string
  modelValue: string
  label: string
  error?: string
  type?: string
  placeholder?: string
}

import type { CommentParentTypeEnum } from '@/types/comment'

export interface ICommentFormProps {
  parentId: string
  parentType: CommentParentTypeEnum
  isReply?: boolean
}

export interface IFormField {
  name: string
  label: string
  type: string
  required?: boolean
  placeholder?: string
  value?: string
  error?: string
}

export interface IFormState {
  fields: Record<string, IFormField>
  isValid: boolean
  isSubmitting: boolean
  message?: string
}

export interface IFormValidation {
  isValid: boolean
  errors: Record<string, string>
}

export interface IFormSubmitEvent {
  isValid: boolean
  data: Record<string, unknown>
  message?: string
}

export interface IFormError {
  field?: string
  message?: string
  code?: string
}

export interface IFormSuccess {
  message?: string
  data?: Record<string, unknown>
}
