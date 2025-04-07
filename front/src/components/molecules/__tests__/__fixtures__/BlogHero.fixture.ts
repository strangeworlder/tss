import { ImageSizeEnum } from '@/types/image';

/**
 * Creates a default set of props for the BlogHero component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogHero component
 */
export function createBlogHeroProps(overrides = {}) {
  return {
    heroImage: 'test-image.jpg',
    altText: 'Test hero image',
    ...overrides,
  };
}

/**
 * Mock data for BlogHero component tests
 */
export const mockBlogHeroes = {
  default: createBlogHeroProps(),
  customAltText: createBlogHeroProps({
    altText: 'Custom alt text for testing',
  }),
  customImage: createBlogHeroProps({
    heroImage: 'custom-test-image.jpg',
  }),
};
