import { mount } from '@vue/test-utils';
import BlogHero from '../BlogHero.vue';
import { ImageSizeEnum } from '@/types/image';
import { createBlogHeroProps } from '@/components/molecules/__tests__/__fixtures__/BlogHero.fixture';

/**
 * Interface for BlogHero component props
 */
interface IBlogHeroProps {
  heroImage: string;
  altText: string;
}

/**
 * Mounts the BlogHero component with the given props
 * @param props - The props to pass to the component
 * @param options - Additional mounting options
 * @returns The mounted component
 */
export function mountBlogHero(props = createBlogHeroProps(), options = {}) {
  return mount(BlogHero, {
    props,
    global: {
      stubs: {
        AppImage: true,
      },
    },
    ...options,
  });
}

/**
 * Creates a default set of props for the BlogHero component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogHero component
 */
export function createDefaultBlogHeroProps(overrides = {}) {
  return {
    heroImage: 'test-image.jpg',
    altText: 'Test hero image',
    ...overrides,
  };
}
