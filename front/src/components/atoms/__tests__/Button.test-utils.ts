import { mount } from '@vue/test-utils';
import Button from '../Button.vue';
import { ButtonVariantEnum } from '@/types/button';
import { createButtonProps } from './__fixtures__/Button.fixture';

/**
 * Interface for Button component props
 */
interface IButtonProps {
  variant?: ButtonVariantEnum;
  disabled?: boolean;
  to?: string;
  ariaLabel?: string;
}

/**
 * Mounts the Button component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountButton(props: IButtonProps = createButtonProps()) {
  return mount(Button, {
    props,
    global: {
      stubs: {
        'router-link': true,
      },
    },
  });
}

/**
 * Creates a default set of props for the Button component
 * @param overrides - Props to override the defaults
 * @returns The props for the Button component
 */
export function createDefaultButtonProps(overrides: Partial<IButtonProps> = {}) {
  return {
    variant: ButtonVariantEnum.PRIMARY,
    disabled: false,
    to: undefined,
    ariaLabel: undefined,
    ...overrides,
  };
}
