import { Types } from 'mongoose';
import { IComment } from '../models/CommentModel';
import CommentModel from '../models/CommentModel';
import BlogPostModel from '../models/BlogPostModel';
import { getCurrentUser } from '../../../middleware/auth';
import { GraphQLError } from 'graphql';

type LeanComment = Omit<IComment, '_id'> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const commentResolvers = {
  Query: {
    getComments: async (_: any, { parentId, parentType }: { parentId: string; parentType: string }) => {
      try {
        const comments = await CommentModel.find({
          parentId: new Types.ObjectId(parentId),
          parentType
        })
        .sort({ createdAt: -1 })
        .lean() as unknown as LeanComment[];

        return comments.map(comment => ({
          ...comment,
          id: comment._id.toString(),
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString()
        }));
      } catch (error) {
        throw new GraphQLError('Error fetching comments');
      }
    },

    getComment: async (_: any, { id }: { id: string }) => {
      try {
        const comment = await CommentModel.findById(id).lean() as unknown as LeanComment | null;
        if (!comment) {
          throw new GraphQLError('Comment not found');
        }
        return {
          ...comment,
          id: comment._id.toString(),
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString()
        };
      } catch (error) {
        throw new GraphQLError('Error fetching comment');
      }
    }
  },

  Mutation: {
    createComment: async (_: any, { input }: { input: any }, context: any) => {
      try {
        const user = await getCurrentUser(context);
        if (!user) {
          throw new GraphQLError('User not authenticated');
        }

        const { parentId, parentType, title, content } = input;

        // Check if parent exists
        if (parentType === 'post') {
          const post = await BlogPostModel.findById(parentId);
          if (!post) {
            throw new GraphQLError('Post not found');
          }
          if (post.author.id?.toString() === user._id.toString()) {
            throw new GraphQLError('Cannot comment on your own post');
          }
        } else if (parentType === 'comment') {
          const parentComment = await CommentModel.findById(parentId);
          if (!parentComment) {
            throw new GraphQLError('Parent comment not found');
          }
          if (parentComment.author.id?.toString() === user._id.toString()) {
            throw new GraphQLError('Cannot comment on your own comment');
          }
        }

        // Check if user has already commented
        const existingComment = await CommentModel.findOne({
          parentId: new Types.ObjectId(parentId),
          parentType,
          'author.id': user._id
        });

        if (existingComment) {
          throw new GraphQLError('You have already commented on this item');
        }

        const comment = await CommentModel.create({
          title,
          content,
          parentId: new Types.ObjectId(parentId),
          parentType,
          author: {
            type: 'user',
            id: user._id,
            name: user.name,
            avatar: user.avatar
          }
        });

        return {
          success: true,
          data: {
            ...comment.toObject(),
            id: comment._id.toString(),
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
          }
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          success: false,
          message: errorMessage
        };
      }
    },

    deleteComment: async (_: any, { input }: { input: any }, context: any) => {
      try {
        const user = await getCurrentUser(context);
        if (!user) {
          throw new GraphQLError('User not authenticated');
        }

        const { commentId } = input;
        const comment = await CommentModel.findById(commentId);

        if (!comment) {
          throw new GraphQLError('Comment not found');
        }

        // Check if user is the author of the comment or the post
        const isCommentAuthor = comment.author.id?.toString() === user._id.toString();
        const isPostAuthor = comment.parentType === 'post' && 
          (await BlogPostModel.findById(comment.parentId))?.author.id?.toString() === user._id.toString();

        if (!isCommentAuthor && !isPostAuthor) {
          throw new GraphQLError('Not authorized to delete this comment');
        }

        await CommentModel.findByIdAndDelete(commentId);

        return {
          success: true,
          message: 'Comment deleted successfully'
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          success: false,
          message: errorMessage
        };
      }
    }
  },

  Comment: {
    replies: async (parent: IComment) => {
      try {
        const replies = await CommentModel.find({
          parentId: parent._id,
          parentType: 'comment'
        })
        .sort({ createdAt: -1 })
        .lean() as unknown as LeanComment[];

        return replies.map(reply => ({
          ...reply,
          id: reply._id.toString(),
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString()
        }));
      } catch (error) {
        throw new GraphQLError('Error fetching replies');
      }
    },

    replyCount: async (parent: IComment) => {
      try {
        return await CommentModel.countDocuments({
          parentId: parent._id,
          parentType: 'comment'
        });
      } catch (error) {
        throw new GraphQLError('Error counting replies');
      }
    }
  }
}; 