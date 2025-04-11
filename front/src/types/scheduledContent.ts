/**
 * Types for scheduled content functionality
 */

export interface IScheduledContent {
  id: string;
  type: 'post' | 'comment';
  content: string;
  publishAt: Date;
  status: 'scheduled' | 'published' | 'cancelled' | 'failed';
  authorId: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: string;
  error?: string;
}

export interface IScheduledContentWithTimer extends IScheduledContent {
  timer?: {
    remainingTime: string;
    isOffline: boolean;
  };
}
