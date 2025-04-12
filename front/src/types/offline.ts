import type { ScheduledContentStatusEnum } from './scheduling';

/**
 * Interface for offline content
 */
export interface IOfflineContent {
  id: string;
  type: 'post' | 'comment';
  content: string;
  publishAt: Date;
  status: ScheduledContentStatusEnum;
  authorId: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: string;
  lastModified: Date;
  syncStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict' | 'synced';
  syncError: string | null;
  lastRetryAt: Date | null;
  retryCount: number;
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

export interface ISyncQueueItem {
  id: string;
  contentId: string;
  type: 'post' | 'comment';
  action: 'create' | 'update' | 'delete';
  data: IOfflineContent;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict' | 'synced';
  priority: number;
  retryCount: number;
  maxRetries: number;
  lastAttempt: Date | null;
  nextAttempt: Date | null;
  lastRetryAt: Date | null;
  error: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict' | 'synced';
  syncError: string | null;
  serverVersion: number | null;
  conflictResolution: 'local' | 'server' | 'manual' | null;
  metadata: {
    deviceId: string;
    userId: string;
    timestamp: number;
  };
}
