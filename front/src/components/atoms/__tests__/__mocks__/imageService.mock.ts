import { vi } from 'vitest'

// Mocks for image service used by AppImage
export const mockImageService = {
  getImageUrl: vi.fn((filename, size, format) => 
    `https://mock-cdn.com/images/${size}/${filename}.${format}`)
} 