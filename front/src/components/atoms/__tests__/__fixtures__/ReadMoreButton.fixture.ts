/**
 * Creates a default set of props for the ReadMoreButton component
 * @param overrides - Props to override the defaults
 * @returns The props for the ReadMoreButton component
 */
export function createReadMoreButtonProps(overrides: Record<string, any> = {}) {
  return {
    to: '/default-path',
    ...overrides
  }
}

/**
 * Mock data for testing the ReadMoreButton component
 */
export const mockReadMoreButtons = {
  default: createReadMoreButtonProps(),
  blogPost: createReadMoreButtonProps({
    to: '/blog/post-1'
  }),
  article: createReadMoreButtonProps({
    to: '/articles/featured-article'
  })
} 