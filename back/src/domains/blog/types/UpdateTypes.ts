import type { Types } from 'mongoose';

export type UpdateStatus = 'pending' | 'approved' | 'rejected' | 'published';

export interface IContentUpdate {
  _id: Types.ObjectId;
  originalContentId: Types.ObjectId;
  contentType: 'post' | 'comment';
  content: {
    title?: string;
    content: string;
    excerpt?: string;
  };
  status: UpdateStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  publishedAt: Date | null;
  author: Types.ObjectId;
  moderator: Types.ObjectId | null;
  moderationNotes: string | null;
  version: number;
}
