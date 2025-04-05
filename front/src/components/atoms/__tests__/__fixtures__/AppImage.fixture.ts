// Test data for AppImage tests
import { ImageSize, ImageFormat } from '@/types/image'

/**
 * Creates test props for the AppImage component
 * @param overrides - Additional props to override defaults
 * @returns Props object for AppImage component
 */
export const createImageProps = (overrides = {}) => ({
  filename: 'test-image.jpg',
  alt: 'Test image',
  size: ImageSize.FULL,
  format: ImageFormat.WEBP,
  lazy: true,
  ...overrides
})

/**
 * Predefined test cases for AppImage component
 */
export const mockImages = {
  valid: {
    filename: 'valid-image.jpg',
    alt: 'Valid test image',
  },
  error: {
    filename: 'non-existent.jpg',
    alt: 'Error test image',
  },
  responsive: {
    filename: 'responsive-image.jpg',
    alt: 'Responsive test image',
    width: 300,
    height: 200,
  },
  customSize: {
    filename: 'custom-size-image.jpg',
    alt: 'Custom size test image',
    size: ImageSize.MEDIUM,
    format: ImageFormat.JPEG,
  },
  accessibility: {
    filename: 'accessibility-image.jpg',
    alt: 'Accessibility test image',
    ariaLabel: 'Custom aria label for accessibility',
  }
} 