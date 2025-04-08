import type { Author } from '@/types/blog';
import type { Props } from '../../AuthorInfo.types';

/**
 * Creates a default set of props for the AuthorInfo component
 * @param overrides - Props to override the defaults
 * @returns The props for the AuthorInfo component
 */
export function createAuthorInfoProps(overrides: Partial<Props> = {}) {
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
    variant: 'left' as const,
    ...overrides,
  } as Props;
}

/**
 * Mock data for AuthorInfo component tests
 */
export const mockAuthorInfos = {
  default: createAuthorInfoProps(),
  noAuthor: createAuthorInfoProps({
    author: undefined,
  }),
  noDate: createAuthorInfoProps({
    date: undefined,
  }),
  smallSize: createAuthorInfoProps({
    size: 'sm' as const,
  }),
  largeSize: createAuthorInfoProps({
    size: 'lg' as const,
  }),
  rightVariant: createAuthorInfoProps({
    variant: 'right' as const,
  }),
  authorWithoutAvatar: createAuthorInfoProps({
    author: {
      type: 'user' as const,
      id: '1',
      name: 'John Doe',
    },
  }),
  authorWithoutName: createAuthorInfoProps({
    author: {
      type: 'user' as const,
      id: '1',
      name: '',
      avatar: {
        filename: 'avatar.jpg',
        altText: '',
      },
    },
  }),
  invalidDate: createAuthorInfoProps({
    date: 'invalid-date',
  }),
};
