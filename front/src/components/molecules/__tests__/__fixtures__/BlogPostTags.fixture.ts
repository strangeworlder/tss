/**
 * Mock tags for testing BlogPostTags component
 */
export const mockTags = {
  default: ['vue', 'typescript', 'testing'],
  empty: [],
  long: [
    'vue',
    'typescript',
    'testing',
    'components',
    'atomic-design',
    'frontend',
    'development',
    'web',
    'javascript',
    'css'
  ],
  single: ['vue']
}

/**
 * Creates mock tags with custom values
 * @param count - Number of tags to create
 * @returns Array of mock tags
 */
export function createMockTags(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `tag-${i + 1}`)
} 