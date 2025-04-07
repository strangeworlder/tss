import { mount } from '@vue/test-utils';
import NavLink from '../NavLink.vue';

/**
 * Interface for NavLink props
 */
export interface INavLinkProps {
  to: string;
  isActive: boolean;
  variant?: 'default' | 'auth';
}

/**
 * Creates default props for the NavLink component
 * @param overrides - Props to override the defaults
 * @returns The props for the NavLink component
 */
export function createDefaultNavLinkProps(overrides: Partial<INavLinkProps> = {}): INavLinkProps {
  return {
    to: '/test-route',
    isActive: false,
    variant: 'default',
    ...overrides,
  };
}

/**
 * Mounts the NavLink component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountNavLink(props: INavLinkProps = createDefaultNavLinkProps()) {
  return mount(NavLink, {
    props,
    global: {
      stubs: {
        RouterLink: true,
      },
    },
  });
}
