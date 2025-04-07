import { BlogPostTitleVariantEnum } from '@/types/blogPost'

interface BlogPostExcerptProps {
  content: string
  variant?: BlogPostTitleVariantEnum
}

/**
 * Creates a default set of props for the BlogPostExcerpt component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogPostExcerpt component
 */
export function createBlogPostExcerptProps(overrides: Partial<BlogPostExcerptProps> = {}) {
  return {
    content: 'This is a test blog post content that should be truncated.',
    variant: BlogPostTitleVariantEnum.FULL,
    ...overrides,
  }
}

/**
 * Mock data for testing the BlogPostExcerpt component
 */
export const mockBlogPostExcerpts = {
  default: createBlogPostExcerptProps(),
  compact: createBlogPostExcerptProps({
    variant: BlogPostTitleVariantEnum.COMPACT,
  }),
  shortContent: createBlogPostExcerptProps({
    content: 'Short content.',
  }),
  longContent: createBlogPostExcerptProps({
    content:
      'This is a very long blog post content that should be truncated because it exceeds the maximum length allowed for the FULL variant. This text should be cut off and an ellipsis should be added at the end.',
  }),
  longContentCompact: createBlogPostExcerptProps({
    content:
      'This is a very long blog post content that should be truncated because it exceeds the maximum length allowed for the COMPACT variant. This text should be cut off and an ellipsis should be added at the end.',
    variant: BlogPostTitleVariantEnum.COMPACT,
  }),
}
