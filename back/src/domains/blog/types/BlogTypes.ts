import type { Types } from 'mongoose';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface IBlogPost {
  _id: Types.ObjectId;
  title: string;
  content: string;
  excerpt: string;
  author: Types.ObjectId;
  status: PostStatus;
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
