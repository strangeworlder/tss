export enum ScheduledContentStatusEnum {
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ISchedule {
  id: string;
  title: string;
  startTime: Date;
  status: string;
  hasConflict: boolean;
  conflictingSchedules?: ISchedule[];
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
