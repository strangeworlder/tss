import type { Author } from '@/types/blog'

/**
 * Props interface for AuthorInfo component
 */
export interface Props {
  /** The author object containing name and optional avatar */
  author?: Author
  /** ISO date string for the content */
  date?: string
  /** Size of the avatar image */
  size: 'sm' | 'md' | 'lg'
}
