import type { Author } from './blog'

export interface Comment {
  id: string
  title: string
  content: string
  author: Author
  parentId: string
  parentType: 'post' | 'comment'
  createdAt: string
  updatedAt: string
  replies: Comment[]
  replyCount: number
}

export interface CreateCommentInput {
  title: string
  content: string
  parentId: string
  parentType: 'post' | 'comment'
}

export interface DeleteCommentInput {
  commentId: string
}

export interface CommentResponse {
  success: boolean
  message?: string
  data?: Comment
}

export interface DeleteCommentResponse {
  success: boolean
  message?: string
}
