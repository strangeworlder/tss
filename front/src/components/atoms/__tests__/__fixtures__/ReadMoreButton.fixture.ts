/**
 * ReadMoreButton component props interface
 */
interface ReadMoreButtonProps {
  to: string;
}

/**
 * Creates a default set of props for the ReadMoreButton component
 * @param overrides - Props to override the defaults
 * @returns The props for the ReadMoreButton component
 */
export function createReadMoreButtonProps(overrides: Partial<ReadMoreButtonProps> = {}) {
  return {
    to: '/default-path',
    ...overrides,
  };
}

/**
 * Mock data for testing the ReadMoreButton component
 */
export const mockReadMoreButtons = {
  default: createReadMoreButtonProps(),
  blogPost: createReadMoreButtonProps({
    to: '/blog/post-1',
  }),
  article: createReadMoreButtonProps({
    to: '/articles/featured-article',
  }),
};
