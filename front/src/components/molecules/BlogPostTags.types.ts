/**
 * BlogPostTags component type definitions
 *
 * @module components/molecules/BlogPostTags.types
 */

import type { IBlogPostTag } from '../../../../shared/types/blog';

/**
 * Props interface for BlogPostTags component
 */
export interface Props {
  /**
   * Array of tag objects to display
   */
  tags: IBlogPostTag[];
  /**
   * Optional callback function when a tag is clicked
   */
  onTagClick?: (tag: IBlogPostTag) => void;
  /**
   * Optional class name for the root element
   */
  className?: string;
  /**
   * Optional flag to show post count for each tag
   */
  showPostCount?: boolean;
  /**
   * Optional flag to show creation date for each tag
   */
  showCreatedAt?: boolean;
  /**
   * Optional flag to show update date for each tag
   */
  showUpdatedAt?: boolean;
}
