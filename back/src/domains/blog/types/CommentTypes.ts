import type { Types } from 'mongoose';

export type CommentStatus = 'pending' | 'published' | 'rejected' | 'flagged';

export interface IComment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  status: CommentStatus;
  publishAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  timezone: string;
  version: number;
  pendingUpdateId: Types.ObjectId | null;
  hasActiveUpdate: boolean;
  originalCommentId: Types.ObjectId | null;
  moderationStatus: CommentStatus;
  abuseScore: number;
  lastModeratedAt: Date | null;
}
