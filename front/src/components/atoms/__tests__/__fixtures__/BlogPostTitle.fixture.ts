import { BlogPostTitleVariantEnum } from '@/types/blogPost'

type BlogPostTitleProps = {
  title: string
  variant: BlogPostTitleVariantEnum
}

/**
 * Creates a default set of props for the BlogPostTitle component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogPostTitle component
 */
export function createBlogPostTitleProps(overrides: Partial<BlogPostTitleProps> = {}) {
  return {
    title: 'Test Blog Post Title',
    variant: BlogPostTitleVariantEnum.FULL,
    ...overrides,
  }
}

/**
 * Mock data for testing the BlogPostTitle component
 */
export const mockBlogPostTitles = {
  default: createBlogPostTitleProps(),
  compact: createBlogPostTitleProps({
    variant: BlogPostTitleVariantEnum.COMPACT,
  }),
  longTitle: createBlogPostTitleProps({
    title: 'This is a very long blog post title that should be properly displayed',
  }),
  emptyTitle: createBlogPostTitleProps({
    title: '',
  }),
  specialCharacters: createBlogPostTitleProps({
    title: 'Special & Characters < > " \' /',
  }),
}
