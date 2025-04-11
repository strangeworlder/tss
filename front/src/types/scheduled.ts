/**
 * Types for scheduled content functionality
 */

export interface IScheduledContent {
  id: string;
  type: 'post' | 'comment';
  content: unknown;
  publishAt: Date;
  status: 'scheduled' | 'published' | 'cancelled' | 'failed';
  authorId: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: string;
  lastModified: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
  syncError?: string;
}
