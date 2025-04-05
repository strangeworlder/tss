import type { ILoadingSpinnerProps } from '../LoadingSpinner.test-utils'

/**
 * Create props for the LoadingSpinner component
 * @param overrides - Props to override the defaults
 * @returns The props for the LoadingSpinner component
 */
export function createLoadingSpinnerProps(overrides: Partial<ILoadingSpinnerProps> = {}): ILoadingSpinnerProps {
  return {
    size: 'md',
    text: 'Loading...',
    ...overrides
  }
}

/**
 * Mock LoadingSpinner components with different configurations
 */
export const mockLoadingSpinners = {
  default: createLoadingSpinnerProps(),
  small: createLoadingSpinnerProps({ size: 'sm' }),
  medium: createLoadingSpinnerProps({ size: 'md' }),
  large: createLoadingSpinnerProps({ size: 'lg' }),
  customText: createLoadingSpinnerProps({ text: 'Processing data...' }),
  noText: createLoadingSpinnerProps({ text: '' })
} 