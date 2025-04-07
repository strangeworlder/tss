import { mount } from '@vue/test-utils'
import BlogPostExcerpt from '../BlogPostExcerpt.vue'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'
import { createBlogPostExcerptProps } from './__fixtures__/BlogPostExcerpt.fixture'

/**
 * Interface for BlogPostExcerpt component props
 */
interface IBlogPostExcerptProps {
  content: string
  variant?: BlogPostTitleVariantEnum
}

/**
 * Mounts the BlogPostExcerpt component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountBlogPostExcerpt(props: IBlogPostExcerptProps = createBlogPostExcerptProps()) {
  return mount(BlogPostExcerpt, {
    props,
  })
}

/**
 * Creates a default set of props for the BlogPostExcerpt component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogPostExcerpt component
 */
export function createDefaultBlogPostExcerptProps(overrides: Partial<IBlogPostExcerptProps> = {}) {
  return {
    content: 'This is a test blog post content that should be truncated.',
    variant: BlogPostTitleVariantEnum.FULL,
    ...overrides,
  }
}
