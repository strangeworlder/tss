import type { Types } from 'mongoose';

export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'pending_update';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface IBlogPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: Types.ObjectId;
  tags: string[];
  status: BlogPostStatus;
  publishAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  timezone: string;
  version: number;
  pendingUpdateId: Types.ObjectId | null;
  hasActiveUpdate: boolean;
  originalPostId: Types.ObjectId | null;
  moderationStatus: ModerationStatus;
  abuseScore: number;
  lastModeratedAt: Date | null;
}
