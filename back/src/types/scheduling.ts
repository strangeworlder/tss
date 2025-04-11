import { BlogPostStatus } from '../domains/blog/models/BlogPostModel';

export interface IScheduledContent {
  id: string;
  type: 'post' | 'comment';
  publishAt: Date;
  status: 'scheduled' | 'published' | 'cancelled' | 'failed';
  timezone: string;
  version: number;
  authorId: string;
  content: string;
}

export interface IPendingUpdate {
  id: string;
  type: 'post' | 'comment';
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
