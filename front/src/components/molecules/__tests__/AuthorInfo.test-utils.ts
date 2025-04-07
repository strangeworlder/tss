import { mount } from '@vue/test-utils';
import AuthorInfo from '../AuthorInfo.vue';
import type { Author } from '@/types/blog';
import { createAuthorInfoProps } from './__fixtures__/AuthorInfo.fixture';
import type { Props } from '../AuthorInfo.types';

/**
 * Interface for AuthorInfo component props
 */
interface IAuthorInfoProps {
  author?: Author;
  date?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Mounts the AuthorInfo component with the given props
 * @param props - The props to pass to the component
 * @param options - Additional mounting options
 * @returns The mounted component
 */
export function mountAuthorInfo(props: Props = createAuthorInfoProps(), options = {}) {
  return mount(AuthorInfo, {
    props,
    global: {
      stubs: {
        Avatar: true,
      },
    },
    ...options,
  });
}

/**
 * Creates a default set of props for the AuthorInfo component
 * @param overrides - Props to override the defaults
 * @returns The props for the AuthorInfo component
 */
export function createDefaultAuthorInfoProps(overrides: Partial<Props> = {}) {
  return {
    author: {
      type: 'user' as const,
      id: '1',
      name: 'John Doe',
      avatar: {
        filename: 'avatar.jpg',
        altText: 'John Doe',
      },
    },
    date: '2024-03-20',
    size: 'md' as const,
    ...overrides,
  } as Props;
}
