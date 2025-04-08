interface MenuToggleProps {
  isOpen: boolean;
}

/**
 * Creates a default set of props for the MenuToggle component
 * @param overrides - Props to override the defaults
 * @returns The props for the MenuToggle component
 */
export function createMenuToggleProps(overrides: Partial<MenuToggleProps> = {}) {
  return {
    isOpen: false,
    ...overrides,
  };
}

/**
 * Mock data for testing the MenuToggle component
 */
export const mockMenuToggles = {
  default: createMenuToggleProps(),
  open: createMenuToggleProps({
    isOpen: true,
  }),
};
