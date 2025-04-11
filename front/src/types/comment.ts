/**
 * Comment-related type definitions
 * These match the backend data structures to ensure consistency
 */

import type { Author } from './blog';

/**
 * Comment parent type enum
 */
export enum CommentParentTypeEnum {
  POST = 'post',
  COMMENT = 'comment',
}

/**
 * Comment status enum
 */
export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  PENDING_UPDATE = 'pending_update',
}

/**
 * Interface representing a comment in the system
 */
export interface IComment {
  id: string;
  _id?: string; // MongoDB ID
  title?: string;
  content: string;
  author: Author;
  parentId: string;
  parentType: CommentParentTypeEnum;
  createdAt: string;
  updatedAt: string;
  replies?: IComment[];
  replyCount: number;
  status: CommentStatus;
  publishAt?: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: string;
  originalCommentId?: string;
  abuseScore: number;
  lastModeratedAt?: string;
}

/**
 * Interface for creating a new comment
 */
export interface CreateCommentInput {
  title?: string;
  content: string;
  parentId: string;
  parentType: CommentParentTypeEnum;
}

/**
 * Interface for updating a comment
 */
export interface UpdateCommentInput {
  title?: string;
  content?: string;
  status?: CommentStatus;
  publishAt?: string;
}

/**
 * Interface for comment API responses
 */
export interface CommentResponse {
  success: boolean;
  data?: IComment;
  message?: string;
  error?: string;
}

/**
 * Interface for comment list API responses
 */
export interface CommentListResponse {
  success: boolean;
  data: {
    comments: IComment[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
  error?: string;
}

/**
 * Comment store interface for state management
 */
export interface ICommentStore {
  comments: IComment[];
  loading: boolean;
  error: string | null;
  fetchComments: (parentId: string, parentType: CommentParentTypeEnum) => Promise<void>;
  createComment: (input: CreateCommentInput) => Promise<IComment>;
  updateComment: (id: string, input: UpdateCommentInput) => Promise<IComment>;
  deleteComment: (id: string) => Promise<void>;
}
