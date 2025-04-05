import { mount } from '@vue/test-utils'
import MenuToggle from '../MenuToggle.vue'
import { createMenuToggleProps } from './__fixtures__/MenuToggle.fixture'

/**
 * Interface for MenuToggle component props
 */
interface IMenuToggleProps {
  isOpen: boolean
}

/**
 * Mounts the MenuToggle component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountMenuToggle(props: IMenuToggleProps = createMenuToggleProps()) {
  return mount(MenuToggle, {
    props,
    global: {
      stubs: {
        Button: true
      }
    }
  })
}

/**
 * Creates a default set of props for the MenuToggle component
 * @param overrides - Props to override the defaults
 * @returns The props for the MenuToggle component
 */
export function createDefaultMenuToggleProps(overrides: Partial<IMenuToggleProps> = {}) {
  return {
    isOpen: false,
    ...overrides
  }
} 