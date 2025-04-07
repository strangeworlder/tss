import { mount } from '@vue/test-utils'
import ReadMoreButton from '../ReadMoreButton.vue'
import { createReadMoreButtonProps } from './__fixtures__/ReadMoreButton.fixture'

/**
 * Interface for ReadMoreButton component props
 */
interface IReadMoreButtonProps {
  to: string
}

/**
 * Mounts the ReadMoreButton component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountReadMoreButton(props: IReadMoreButtonProps = createReadMoreButtonProps()) {
  return mount(ReadMoreButton, {
    props,
    global: {
      stubs: {
        Button: true,
      },
    },
  })
}

/**
 * Creates a default set of props for the ReadMoreButton component
 * @param overrides - Props to override the defaults
 * @returns The props for the ReadMoreButton component
 */
export function createDefaultReadMoreButtonProps(overrides: Partial<IReadMoreButtonProps> = {}) {
  return {
    to: '/default-path',
    ...overrides,
  }
}
