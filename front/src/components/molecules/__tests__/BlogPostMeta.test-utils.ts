import type { Author } from '@/types/blog'

/**
 * Creates a mock author object for testing
 * @param overrides - Optional overrides for the default author properties
 * @returns A mock Author object
 */
export const createMockAuthor = (overrides: Partial<Author> = {}): Author => {
  return {
    name: 'John Doe',
    type: 'text',
    id: '123',
    ...overrides,
  }
}

/**
 * Creates default props for the BlogPostMeta component
 * @param overrides - Optional overrides for the default props
 * @returns Default props for the BlogPostMeta component
 */
export const createDefaultProps = (overrides = {}) => {
  return {
    date: '2023-01-15',
    author: createMockAuthor(),
    ...overrides,
  }
}

/**
 * Mock data for testing the BlogPostMeta component
 */
export const mockData = {
  authors: {
    default: createMockAuthor(),
    anonymous: createMockAuthor({ name: 'Anonymous', id: undefined }),
    withAvatar: createMockAuthor({
      name: 'Jane Smith',
      id: '456',
      avatar: { filename: 'avatar.jpg', altText: 'Jane Smith avatar' },
    }),
  },
  dates: {
    default: '2023-01-15',
    empty: '',
    future: '2025-12-31',
    past: '2020-06-01',
  },
}
