import { mount, VueWrapper } from '@vue/test-utils'
import LoadingSpinner from '../LoadingSpinner.vue'

/**
 * Interface for LoadingSpinner component props
 */
export interface ILoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

/**
 * Mounts the LoadingSpinner component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountLoadingSpinner(props: ILoadingSpinnerProps = createDefaultLoadingSpinnerProps()): VueWrapper {
  return mount(LoadingSpinner, {
    props
  })
}

/**
 * Creates a default set of props for the LoadingSpinner component
 * @param overrides - Props to override the defaults
 * @returns The props for the LoadingSpinner component
 */
export function createDefaultLoadingSpinnerProps(overrides: Partial<ILoadingSpinnerProps> = {}): ILoadingSpinnerProps {
  return {
    size: 'md' as 'sm' | 'md' | 'lg',
    text: 'Loading...',
    ...overrides
  }
} 