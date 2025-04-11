export enum ScheduledContentStatusEnum {
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface IScheduledContent {
  id: string;
  type: 'post' | 'comment';
  content: {
    title: string;
    content: string;
  };
  publishAt: Date;
  status: ScheduledContentStatusEnum;
  authorId: string;
  version: number;
  hasActiveUpdate: boolean;
  lastModified: Date;
}
