import { ImageSize } from '@/types/image'

/**
 * Creates test props for the BlogPostImage component
 * @param overrides - Properties to override defaults
 * @returns Object with BlogPostImage props
 */
export const createBlogPostImageProps = (overrides = {}) => ({
  alt: 'Test blog image',
  filename: 'test-image.webp',
  size: ImageSize.MEDIUM,
  variant: 'full',
  ...overrides
})

/**
 * BlogPostImage test cases
 */
export const mockBlogPostImages = {
  default: {
    alt: 'Default blog image',
    filename: 'default-image.webp',
    size: ImageSize.MEDIUM,
    variant: 'full'
  },
  compact: {
    alt: 'Compact blog image',
    filename: 'compact-image.webp',
    size: ImageSize.MEDIUM,
    variant: 'compact'
  },
  withUrl: {
    alt: 'Blog image with URL',
    url: 'https://example.com/image.jpg',
    size: ImageSize.MEDIUM,
    variant: 'full'
  },
  large: {
    alt: 'Large blog image',
    filename: 'large-image.webp',
    size: ImageSize.FULL,
    variant: 'full'
  },
  noFilename: {
    alt: 'Blog image without filename',
    size: ImageSize.MEDIUM,
    variant: 'full'
  }
} 