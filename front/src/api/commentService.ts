import { api } from './api'
import type { IComment } from '@/types/comment'
import { CommentParentTypeEnum } from '@/types/comment'

export interface ICreateCommentParams {
  title?: string
  content: string
  parentId: string
  parentType: CommentParentTypeEnum
}

export const getComments = async (
  parentId: string,
  parentType: CommentParentTypeEnum = CommentParentTypeEnum.POST,
): Promise<IComment[]> => {
  const endpoint =
    parentType === CommentParentTypeEnum.POST
      ? `/v1/blog/posts/${parentId}/comments`
      : `/v1/blog/comments/${parentId}/replies`

  try {
    const response = await api.get(endpoint)
    console.log('Raw API response for comments:', response.data)

    // Handle the response structure based on the logs
    if (response.data.success && response.data.data) {
      // If data is an array, return it directly
      if (Array.isArray(response.data.data)) {
        return response.data.data
      }
      // If data has a comments property, return that
      if (response.data.data.comments && Array.isArray(response.data.data.comments)) {
        return response.data.data.comments
      }
      // If data is an object with a comment property, wrap it in an array
      if (response.data.data.comment) {
        return [response.data.data.comment]
      }
    }

    // If we get here, the response structure is unexpected
    console.error('Unexpected response structure for comments:', response.data)
    return []
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw error
  }
}

export const createComment = async (params: ICreateCommentParams): Promise<IComment> => {
  try {
    const response = await api.post('/v1/blog/posts/comments', params)
    console.log('Raw API response for creating comment:', response.data)

    if (response.data.success && response.data.data) {
      if (response.data.data.comment) {
        return response.data.data.comment
      }
      // If data is the comment itself
      if (response.data.data._id || response.data.data.id) {
        return response.data.data
      }
    }

    console.error('Unexpected response structure for creating comment:', response.data)
    throw new Error('Failed to create comment: Invalid response structure')
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const response = await api.delete(`/v1/blog/comments/${commentId}`)
    console.log('Raw API response for deleting comment:', response.data)

    if (!response.data.success) {
      throw new Error('Failed to delete comment: Server returned unsuccessful response')
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

export const updateCommentStatus = async (commentId: string, status: string): Promise<IComment> => {
  const response = await api.patch(`/v1/blog/comments/${commentId}/status`, { status })
  return response.data.data.comment
}
