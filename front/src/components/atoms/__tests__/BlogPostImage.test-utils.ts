import { mount, type VueWrapper } from '@vue/test-utils';
import BlogPostImage from '../BlogPostImage.vue';
import { createBlogPostImageProps } from './__fixtures__/BlogPostImage.fixture';
import type { ImageSizeEnum } from '@/types/image';
import type { BlogPostTitleVariantEnum } from '@/types/blogPost';

interface BlogPostImageProps {
  filename?: string;
  url?: string;
  alt: string;
  size?: ImageSizeEnum;
  variant?: BlogPostTitleVariantEnum;
}

/**
 * Mounts the BlogPostImage component with the given props
 * @param props - Props to pass to the component
 * @returns VueWrapper instance
 */
export const mountBlogPostImage = (props = {}): VueWrapper => {
  return mount(BlogPostImage, {
    props: createBlogPostImageProps(props) as BlogPostImageProps,
    global: {
      stubs: {
        AppImage: true,
      },
    },
  });
};

/**
 * Gets the variant class applied to the component
 * @param wrapper - VueWrapper instance
 * @returns string representing the variant class
 */
export const getVariantClass = (wrapper: VueWrapper): string => {
  const classes = wrapper.find('.blog-post-image').classes();
  return classes.find((cls) => cls.startsWith('blog-post-image--')) || '';
};

/**
 * Checks if the component has the correct aria-label
 * @param wrapper - VueWrapper instance
 * @param expectedLabel - Expected aria-label
 * @returns boolean indicating if aria-label matches
 */
export const hasCorrectAriaLabel = (wrapper: VueWrapper, expectedLabel: string): boolean => {
  return wrapper.find('.blog-post-image').attributes('aria-label') === expectedLabel;
};

/**
 * Checks if the component has the correct role
 * @param wrapper - VueWrapper instance
 * @returns boolean indicating if role is 'img'
 */
export const hasCorrectRole = (wrapper: VueWrapper): boolean => {
  return wrapper.find('.blog-post-image').attributes('role') === 'img';
};
