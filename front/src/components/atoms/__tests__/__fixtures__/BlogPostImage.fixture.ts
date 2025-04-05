import type { ImageMetadata } from '@/types/image'
import { ImageSizeEnum } from '@/types/image'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'

/**
 * Creates test props for the BlogPostImage component
 * @param overrides - Properties to override defaults
 * @returns Object with BlogPostImage props
 */
export const createBlogPostImageProps = (overrides = {}) => ({
  alt: 'Test blog image',
  filename: 'test-image.webp',
  size: ImageSizeEnum.MEDIUM,
  variant: BlogPostTitleVariantEnum.FULL,
  ...overrides
})

/**
 * BlogPostImage test cases
 */
export const mockBlogPostImages = {
  default: {
    alt: 'Default blog image',
    filename: 'default-image.webp',
    size: ImageSizeEnum.MEDIUM,
    variant: BlogPostTitleVariantEnum.FULL
  },
  compact: {
    alt: 'Compact blog image',
    filename: 'compact-image.webp',
    size: ImageSizeEnum.MEDIUM,
    variant: BlogPostTitleVariantEnum.COMPACT
  },
  withUrl: {
    alt: 'Blog image with URL',
    url: 'https://example.com/image.jpg',
    size: ImageSizeEnum.MEDIUM,
    variant: BlogPostTitleVariantEnum.FULL
  },
  large: {
    alt: 'Large blog image',
    filename: 'large-image.webp',
    size: ImageSizeEnum.FULL,
    variant: BlogPostTitleVariantEnum.FULL
  },
  noFilename: {
    alt: 'Blog image without filename',
    size: ImageSizeEnum.MEDIUM,
    variant: BlogPostTitleVariantEnum.FULL
  }
} 