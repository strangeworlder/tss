import { mount } from '@vue/test-utils';
import BlogPostTitle from '../BlogPostTitle.vue';
import { BlogPostTitleVariantEnum } from '@/types/blogPost';
import { createBlogPostTitleProps } from './__fixtures__/BlogPostTitle.fixture';

/**
 * Interface for BlogPostTitle component props
 */
interface IBlogPostTitleProps {
  title: string;
  variant?: BlogPostTitleVariantEnum;
}

/**
 * Mounts the BlogPostTitle component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountBlogPostTitle(props: IBlogPostTitleProps = createBlogPostTitleProps()) {
  return mount(BlogPostTitle, {
    props,
    global: {
      stubs: {},
    },
  });
}

/**
 * Creates a default set of props for the BlogPostTitle component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogPostTitle component
 */
export function createDefaultBlogPostTitleProps(overrides: Partial<IBlogPostTitleProps> = {}) {
  return {
    title: 'Test Blog Post Title',
    variant: BlogPostTitleVariantEnum.FULL,
    ...overrides,
  };
}
