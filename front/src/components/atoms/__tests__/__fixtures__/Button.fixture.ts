import { ButtonVariantEnum } from '@/types/button'

/**
 * Creates a default set of props for the Button component
 * @param overrides - Props to override the defaults
 * @returns The props for the Button component
 */
export function createButtonProps(overrides: Record<string, any> = {}) {
  return {
    variant: ButtonVariantEnum.PRIMARY,
    disabled: false,
    to: undefined,
    ariaLabel: undefined,
    ...overrides
  }
}

/**
 * Mock data for testing the Button component
 */
export const mockButtons = {
  default: createButtonProps(),
  secondary: createButtonProps({
    variant: ButtonVariantEnum.SECONDARY
  }),
  danger: createButtonProps({
    variant: ButtonVariantEnum.DANGER
  }),
  text: createButtonProps({
    variant: ButtonVariantEnum.TEXT
  }),
  disabled: createButtonProps({
    disabled: true
  }),
  withTo: createButtonProps({
    to: '/some-path'
  }),
  withAriaLabel: createButtonProps({
    ariaLabel: 'Accessible Button'
  })
} 