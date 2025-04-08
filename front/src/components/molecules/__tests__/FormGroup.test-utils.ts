import { mount } from '@vue/test-utils';
import FormGroup from '../FormGroup.vue';
import type { IFormFieldProps } from '@/types/form';
import { createFormGroupProps } from '@/components/molecules/__tests__/__fixtures__/FormGroup.fixture';

/**
 * Mounts the FormGroup component with the given props
 * @param props - The props to pass to the component
 * @param options - Additional mounting options
 * @returns The mounted component
 */
export function mountFormGroup(props = createFormGroupProps(), options = {}) {
  return mount(FormGroup, {
    props,
    ...options,
  });
}

/**
 * Creates a default set of props for the FormGroup component
 * @param overrides - Props to override the defaults
 * @returns The props for the FormGroup component
 */
export function createDefaultFormGroupProps(overrides = {}): IFormFieldProps {
  return {
    id: 'test-input',
    label: 'Test Label',
    modelValue: '',
    ...overrides,
  };
}
