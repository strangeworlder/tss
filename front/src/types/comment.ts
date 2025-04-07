import type { Author } from './blog';

export interface Comment {
  id: string;
  title: string;
  content: string;
  author: Author;
  parentId: string;
  parentType: 'post' | 'comment';
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
  replyCount: number;
}

export interface CreateCommentInput {
  title: string;
  content: string;
  parentId: string;
  parentType: 'post' | 'comment';
}

export interface DeleteCommentInput {
  commentId: string;
}

export interface CommentResponse {
  success: boolean;
  message?: string;
  data?: Comment;
}

export interface DeleteCommentResponse {
  success: boolean;
  message?: string;
}

export enum CommentParentTypeEnum {
  POST = 'post',
  COMMENT = 'comment',
}

export interface IAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface IComment {
  _id: string;
  title?: string;
  content: string;
  author: IAuthor;
  createdAt: string;
  parentId: string;
  parentType: CommentParentTypeEnum;
  replies?: IComment[];
}
