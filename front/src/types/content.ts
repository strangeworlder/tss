export interface IScheduledContent {
  id: string;
  title: string;
  content: string;
  publishAt: Date;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}
