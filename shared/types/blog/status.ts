import { BlogPostStatus } from './blog.js';

/**
 * Type guard to check if a status transition is valid
 * @param currentStatus - Current status of the blog post
 * @param newStatus - New status to transition to
 * @returns true if the transition is valid
 */
export function isValidStatusTransition(
  currentStatus: BlogPostStatus,
  newStatus: BlogPostStatus
): boolean {
  const validTransitions: Record<BlogPostStatus, BlogPostStatus[]> = {
    [BlogPostStatus.DRAFT]: [
      BlogPostStatus.SCHEDULED,
      BlogPostStatus.PUBLISHING,
      BlogPostStatus.ARCHIVED,
      BlogPostStatus.CANCELLED,
    ],
    [BlogPostStatus.SCHEDULED]: [
      BlogPostStatus.PUBLISHING,
      BlogPostStatus.DRAFT,
      BlogPostStatus.ARCHIVED,
      BlogPostStatus.CANCELLED,
    ],
    [BlogPostStatus.PUBLISHING]: [BlogPostStatus.PUBLISHED, BlogPostStatus.FAILED],
    [BlogPostStatus.PUBLISHED]: [BlogPostStatus.ARCHIVED],
    [BlogPostStatus.FAILED]: [
      BlogPostStatus.DRAFT,
      BlogPostStatus.SCHEDULED,
      BlogPostStatus.ARCHIVED,
    ],
    [BlogPostStatus.ARCHIVED]: [BlogPostStatus.DRAFT],
    [BlogPostStatus.CANCELLED]: [BlogPostStatus.DRAFT],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Type guard to check if a status is a final state
 * @param status - Status to check
 * @returns true if the status is a final state
 */
export function isFinalStatus(status: BlogPostStatus): boolean {
  return [BlogPostStatus.PUBLISHED, BlogPostStatus.ARCHIVED].includes(status);
}

/**
 * Type guard to check if a status is a draft state
 * @param status - Status to check
 * @returns true if the status is a draft state
 */
export function isDraftStatus(status: BlogPostStatus): boolean {
  return [BlogPostStatus.DRAFT, BlogPostStatus.SCHEDULED].includes(status);
}

/**
 * Type guard to check if a status is a published state
 * @param status - Status to check
 * @returns true if the status is a published state
 */
export function isPublishedStatus(status: BlogPostStatus): boolean {
  return [BlogPostStatus.PUBLISHED, BlogPostStatus.ARCHIVED].includes(status);
}

/**
 * Type guard to check if a status is a scheduled state
 * @param status - Status to check
 * @returns true if the status is a scheduled state
 */
export function isScheduledStatus(status: BlogPostStatus): boolean {
  return status === BlogPostStatus.SCHEDULED;
}

/**
 * Type guard to check if a status is a failed state
 * @param status - Status to check
 * @returns true if the status is a failed state
 */
export function isFailedStatus(status: BlogPostStatus): boolean {
  return status === BlogPostStatus.FAILED;
}

/**
 * Type guard to check if a status is a publishing state
 * @param status - Status to check
 * @returns true if the status is a publishing state
 */
export function isPublishingStatus(status: BlogPostStatus): boolean {
  return status === BlogPostStatus.PUBLISHING;
}

/**
 * Type guard to check if a status is an archived state
 * @param status - Status to check
 * @returns true if the status is an archived state
 */
export function isArchivedStatus(status: BlogPostStatus): boolean {
  return status === BlogPostStatus.ARCHIVED;
}

/**
 * Validates a status transition and throws an error if invalid
 * @param currentStatus - Current status of the blog post
 * @param newStatus - New status to transition to
 * @throws Error if the transition is invalid
 */
export function validateStatusTransition(
  currentStatus: BlogPostStatus,
  newStatus: BlogPostStatus
): void {
  if (!isValidStatusTransition(currentStatus, newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }
}

/**
 * Gets the next valid statuses for a given status
 * @param status - Current status
 * @returns Array of valid next statuses
 */
export function getNextValidStatuses(status: BlogPostStatus): BlogPostStatus[] {
  const validTransitions: Record<BlogPostStatus, BlogPostStatus[]> = {
    [BlogPostStatus.DRAFT]: [
      BlogPostStatus.SCHEDULED,
      BlogPostStatus.PUBLISHING,
      BlogPostStatus.ARCHIVED,
      BlogPostStatus.CANCELLED,
    ],
    [BlogPostStatus.SCHEDULED]: [
      BlogPostStatus.PUBLISHING,
      BlogPostStatus.DRAFT,
      BlogPostStatus.ARCHIVED,
      BlogPostStatus.CANCELLED,
    ],
    [BlogPostStatus.PUBLISHING]: [BlogPostStatus.PUBLISHED, BlogPostStatus.FAILED],
    [BlogPostStatus.PUBLISHED]: [BlogPostStatus.ARCHIVED],
    [BlogPostStatus.FAILED]: [
      BlogPostStatus.DRAFT,
      BlogPostStatus.SCHEDULED,
      BlogPostStatus.ARCHIVED,
    ],
    [BlogPostStatus.ARCHIVED]: [BlogPostStatus.DRAFT],
    [BlogPostStatus.CANCELLED]: [BlogPostStatus.DRAFT],
  };

  return validTransitions[status] ?? [];
}
