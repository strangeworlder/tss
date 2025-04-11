import type { ScheduledContentStatusEnum } from './scheduling';

/**
 * Interface for offline content
 */
export interface IOfflineContent {
  id: string;
  type: 'post' | 'comment';
  content: string;
  publishAt: Date;
  status: ScheduledContentStatusEnum | 'scheduled' | 'published' | 'cancelled' | 'failed';
  authorId: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: string;
  lastModified: Date;
  syncStatus: 'pending' | 'synced' | 'failed' | 'conflict';
  syncError?: string;
  retryCount: number;
  lastRetryAt?: Date;
  maxRetries: number;
  serverVersion?: number;
  conflictResolution?: 'local' | 'server' | 'manual';
}

/**
 * Interface for offline timers
 */
export interface IOfflineTimer {
  contentId: string;
  publishAt: Date;
  lastUpdated: Date;
  isActive: boolean;
}
