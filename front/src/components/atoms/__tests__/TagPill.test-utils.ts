import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import TagPill from '../TagPill.vue';
import { createTagPillProps } from './__fixtures__/TagPill.fixture';

/**
 * Interface for TagPill component props
 */
interface ITagPillProps {
  tag: string;
  clickable?: boolean;
}

/**
 * Mounts the TagPill component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountTagPill(props: ITagPillProps = createTagPillProps()) {
  return mount(TagPill, {
    props,
    global: {
      stubs: {
        'router-link': true,
      },
      mocks: {
        $router: {
          push: vi.fn(),
        },
      },
    },
  });
}

/**
 * Creates a default set of props for the TagPill component
 * @param overrides - Props to override the defaults
 * @returns The props for the TagPill component
 */
export function createDefaultTagPillProps(overrides: Partial<ITagPillProps> = {}) {
  return {
    tag: 'test-tag',
    clickable: true,
    ...overrides,
  };
}
