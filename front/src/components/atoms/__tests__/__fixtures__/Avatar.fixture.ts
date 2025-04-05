/**
 * Creates test props for the Avatar component
 * @param overrides - Properties to override defaults
 * @returns Object with Avatar props
 */
export const createAvatarProps = (overrides = {}) => ({
  alt: 'Test avatar',
  src: '',
  size: 'md',
  ...overrides
})

/**
 * Avatar test cases
 */
export const mockAvatars = {
  withImage: {
    alt: 'User with image',
    src: 'valid-image.jpg',
    size: 'md'
  },
  withPlaceholder: {
    alt: 'User with placeholder',
    size: 'md'
  },
  empty: {
    alt: 'Empty avatar',
    size: 'sm'
  },
  error: {
    alt: 'Avatar with error',
    src: 'invalid-image.jpg',
    size: 'lg'
  },
  sizes: {
    small: {
      alt: 'Small avatar',
      size: 'sm'
    },
    medium: {
      alt: 'Medium avatar',
      size: 'md'
    },
    large: {
      alt: 'Large avatar',
      size: 'lg'
    }
  }
}