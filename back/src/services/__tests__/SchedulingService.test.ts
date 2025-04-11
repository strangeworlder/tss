import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Types } from 'mongoose';
import { SchedulingService } from '../SchedulingService';
import { BlogPostModel } from '../../domains/blog/models/BlogPostModel';
import { CommentModel } from '../../domains/blog/models/CommentModel';
import ScheduledContentModel from '../../domains/scheduledContent/models/ScheduledContentModel';
import ConfigurationService from '../ConfigurationService';
import MonitoringService from '../MonitoringService';
import ErrorHandler from '../ErrorHandler';
import { BlogPostStatus } from '../../domains/blog/models/BlogPostModel';
import type { IBlogPost } from '../../domains/blog/models/BlogPostModel';
import type { IComment } from '../../domains/blog/models/CommentModel';
import type { IScheduledContent } from '../../types/scheduling';

// Mock the models
vi.mock('../../domains/blog/models/BlogPostModel');
vi.mock('../../domains/blog/models/CommentModel');
vi.mock('../../domains/scheduledContent/models/ScheduledContentModel');
vi.mock('../ConfigurationService');
vi.mock('../MonitoringService');
vi.mock('../ErrorHandler');

describe('SchedulingService', () => {
  let schedulingService: SchedulingService;

  beforeEach(() => {
    vi.clearAllMocks();
    schedulingService = SchedulingService.getInstance();

    // Mock ConfigurationService.getGlobalDelay
    vi.mocked(ConfigurationService.getGlobalDelay).mockResolvedValue({
      delayHours: 24,
      updatedBy: 'test-user',
      updatedAt: new Date(),
    });

    // Mock MonitoringService.updateHealthCheck
    vi.mocked(MonitoringService.updateHealthCheck).mockImplementation(() => {});

    // Mock ErrorHandler.handleError
    vi.mocked(ErrorHandler.handleError).mockImplementation(() => {});
  });

  afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize the service with global delay settings', async () => {
      // Act
      await schedulingService.initialize();

      // Assert
      expect(ConfigurationService.getGlobalDelay).toHaveBeenCalled();
      expect(MonitoringService.updateHealthCheck).toHaveBeenCalledWith('scheduling', {
        name: 'scheduling',
        status: 'healthy',
        message: 'Scheduling service initialized',
        timestamp: expect.any(Date),
      });
    });

    it('should handle initialization errors', async () => {
      // Arrange
      const error = new Error('Initialization failed');
      vi.mocked(ConfigurationService.getGlobalDelay).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.initialize()).rejects.toThrow('Initialization failed');
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        severity: 'high',
        category: 'scheduling',
        context: { operation: 'initialize' },
      });
      expect(MonitoringService.updateHealthCheck).toHaveBeenCalledWith('scheduling', {
        name: 'scheduling',
        status: 'degraded',
        message: 'Scheduling service initialization failed',
        timestamp: expect.any(Date),
      });
    });
  });

  describe('schedulePost', () => {
    it('should schedule a post for publication', async () => {
      // Arrange
      const postId = new Types.ObjectId();
      const authorId = new Types.ObjectId();
      const publishAt = new Date();
      const mockPost = {
        _id: postId,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        author: {
          type: 'user',
          id: authorId,
          name: 'Test Author',
        },
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
        isPublished: false,
        status: BlogPostStatus.DRAFT,
        timezone: 'UTC',
        version: 1,
        hasActiveUpdate: false,
      } as unknown as IBlogPost;

      const mockScheduledContent = {
        _id: new Types.ObjectId(),
        type: 'post',
        content: postId.toString(),
        authorId: authorId.toString(),
        publishAt,
        status: BlogPostStatus.SCHEDULED,
        timezone: 'UTC',
        version: 1,
      };

      vi.mocked(ScheduledContentModel.create).mockResolvedValue(mockScheduledContent as any);

      // Act
      const result = await schedulingService.schedulePost(mockPost, publishAt);

      // Assert
      expect(ScheduledContentModel.create).toHaveBeenCalledWith({
        type: 'post',
        content: postId.toString(),
        authorId: authorId.toString(),
        publishAt,
        status: BlogPostStatus.SCHEDULED,
        timezone: 'UTC',
        version: 1,
      });
      expect(result).toEqual({
        id: mockScheduledContent._id.toString(),
        type: mockScheduledContent.type,
        content: mockScheduledContent.content,
        authorId: mockScheduledContent.authorId,
        publishAt: mockScheduledContent.publishAt,
        status: mockScheduledContent.status,
        timezone: mockScheduledContent.timezone,
        version: mockScheduledContent.version,
      });
    });

    it('should handle errors when scheduling a post', async () => {
      // Arrange
      const postId = new Types.ObjectId();
      const authorId = new Types.ObjectId();
      const publishAt = new Date();
      const mockPost = {
        _id: postId,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        author: {
          type: 'user',
          id: authorId,
          name: 'Test Author',
        },
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
        isPublished: false,
        status: BlogPostStatus.DRAFT,
        timezone: 'UTC',
        version: 1,
        hasActiveUpdate: false,
      } as unknown as IBlogPost;

      const error = new Error('Failed to schedule post');
      vi.mocked(ScheduledContentModel.create).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.schedulePost(mockPost, publishAt)).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.schedulePost',
          postId: postId.toString(),
          publishAt: publishAt.toISOString(),
          type: 'post',
        },
      });
    });
  });

  describe('scheduleComment', () => {
    it('should schedule a comment for publication', async () => {
      // Arrange
      const commentId = new Types.ObjectId();
      const authorId = new Types.ObjectId();
      const publishAt = new Date();
      const mockComment = {
        _id: commentId,
        title: 'Test Comment',
        content: 'Test content',
        author: {
          type: 'user',
          id: authorId,
          name: 'Test Author',
        },
        parentId: new Types.ObjectId(),
        parentType: 'post',
        status: BlogPostStatus.DRAFT,
        publishAt: null,
        timezone: 'UTC',
        version: 1,
        replyDepth: 0,
        hasActiveUpdate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IBlogPost;

      const mockScheduledContent = {
        _id: new Types.ObjectId(),
        type: 'comment',
        content: commentId.toString(),
        authorId: authorId.toString(),
        publishAt,
        status: BlogPostStatus.SCHEDULED,
        timezone: 'UTC',
        version: 1,
      };

      vi.mocked(ScheduledContentModel.create).mockResolvedValue(mockScheduledContent as any);

      // Act
      const result = await schedulingService.scheduleComment(mockComment, publishAt);

      // Assert
      expect(ScheduledContentModel.create).toHaveBeenCalledWith({
        type: 'comment',
        content: commentId.toString(),
        authorId: authorId.toString(),
        publishAt,
        status: BlogPostStatus.SCHEDULED,
        timezone: 'UTC',
        version: 1,
      });
      expect(result).toEqual({
        id: mockScheduledContent._id.toString(),
        type: mockScheduledContent.type,
        content: mockScheduledContent.content,
        authorId: mockScheduledContent.authorId,
        publishAt: mockScheduledContent.publishAt,
        status: mockScheduledContent.status,
        timezone: mockScheduledContent.timezone,
        version: mockScheduledContent.version,
      });
    });

    it('should handle errors when scheduling a comment', async () => {
      // Arrange
      const commentId = new Types.ObjectId();
      const authorId = new Types.ObjectId();
      const publishAt = new Date();
      const mockComment = {
        _id: commentId,
        title: 'Test Comment',
        content: 'Test content',
        author: {
          type: 'user',
          id: authorId,
          name: 'Test Author',
        },
        parentId: new Types.ObjectId(),
        parentType: 'post',
        status: BlogPostStatus.DRAFT,
        publishAt: null,
        timezone: 'UTC',
        version: 1,
        replyDepth: 0,
        hasActiveUpdate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IBlogPost;

      const error = new Error('Failed to schedule comment');
      vi.mocked(ScheduledContentModel.create).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.scheduleComment(mockComment, publishAt)).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.scheduleComment',
          commentId: commentId.toString(),
          publishAt: publishAt.toISOString(),
          type: 'comment',
        },
      });
    });
  });

  describe('updateScheduledContent', () => {
    it('should update scheduled content', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const updates: Partial<IScheduledContent> = {
        publishAt: new Date(),
        status: 'scheduled',
      };

      const mockScheduledContent = {
        _id: new Types.ObjectId(),
        type: 'post',
        content: 'content-id',
        authorId: 'author-id',
        publishAt: updates.publishAt,
        status: updates.status,
        timezone: 'UTC',
        version: 1,
      };

      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockResolvedValue(
        mockScheduledContent as any
      );

      // Act
      const result = await schedulingService.updateScheduledContent(contentId, updates);

      // Assert
      expect(ScheduledContentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        contentId,
        { $set: updates },
        { new: true }
      );
      expect(result).toEqual({
        id: mockScheduledContent._id.toString(),
        type: mockScheduledContent.type,
        content: mockScheduledContent.content,
        authorId: mockScheduledContent.authorId,
        publishAt: mockScheduledContent.publishAt,
        status: mockScheduledContent.status,
        timezone: mockScheduledContent.timezone,
        version: mockScheduledContent.version,
      });
    });

    it('should handle errors when updating scheduled content', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const updates: Partial<IScheduledContent> = {
        publishAt: new Date(),
        status: 'scheduled',
      };

      const error = new Error('Failed to update scheduled content');
      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.updateScheduledContent(contentId, updates)).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.updateScheduledContent',
          contentId,
          updates: JSON.stringify(updates),
        },
      });
    });

    it('should throw an error if scheduled content is not found', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const updates: Partial<IScheduledContent> = {
        publishAt: new Date(),
        status: 'scheduled',
      };

      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockResolvedValue(null);

      // Act & Assert
      await expect(schedulingService.updateScheduledContent(contentId, updates)).rejects.toThrow(
        `Scheduled content with id ${contentId} not found`
      );
    });
  });

  describe('cancelScheduledContent', () => {
    it('should cancel scheduled content', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const mockScheduledContent = {
        _id: new Types.ObjectId(),
        type: 'post',
        content: 'content-id',
        authorId: 'author-id',
        publishAt: new Date(),
        status: BlogPostStatus.CANCELLED,
        timezone: 'UTC',
        version: 1,
      };

      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockResolvedValue(
        mockScheduledContent as any
      );

      // Act
      const result = await schedulingService.cancelScheduledContent(contentId);

      // Assert
      expect(ScheduledContentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        contentId,
        { $set: { status: BlogPostStatus.CANCELLED } },
        { new: true }
      );
      expect(result).toEqual({
        id: mockScheduledContent._id.toString(),
        type: mockScheduledContent.type,
        content: mockScheduledContent.content,
        authorId: mockScheduledContent.authorId,
        publishAt: mockScheduledContent.publishAt,
        status: mockScheduledContent.status,
        timezone: mockScheduledContent.timezone,
        version: mockScheduledContent.version,
      });
    });

    it('should handle errors when cancelling scheduled content', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const error = new Error('Failed to cancel scheduled content');
      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.cancelScheduledContent(contentId)).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.cancelScheduledContent',
          contentId,
        },
      });
    });

    it('should throw an error if scheduled content is not found', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockResolvedValue(null);

      // Act & Assert
      await expect(schedulingService.cancelScheduledContent(contentId)).rejects.toThrow(
        `Scheduled content with id ${contentId} not found`
      );
    });
  });

  describe('rescheduleContent', () => {
    it('should reschedule content', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const newPublishAt = new Date();
      const mockScheduledContent = {
        _id: new Types.ObjectId(),
        type: 'post',
        content: 'content-id',
        authorId: 'author-id',
        publishAt: newPublishAt,
        status: BlogPostStatus.SCHEDULED,
        timezone: 'UTC',
        version: 1,
      };

      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockResolvedValue(
        mockScheduledContent as any
      );

      // Act
      const result = await schedulingService.rescheduleContent(contentId, newPublishAt);

      // Assert
      expect(ScheduledContentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        contentId,
        { $set: { publishAt: newPublishAt, status: BlogPostStatus.SCHEDULED } },
        { new: true }
      );
      expect(result).toEqual({
        id: mockScheduledContent._id.toString(),
        type: mockScheduledContent.type,
        content: mockScheduledContent.content,
        authorId: mockScheduledContent.authorId,
        publishAt: mockScheduledContent.publishAt,
        status: mockScheduledContent.status,
        timezone: mockScheduledContent.timezone,
        version: mockScheduledContent.version,
      });
    });

    it('should handle errors when rescheduling content', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const newPublishAt = new Date();
      const error = new Error('Failed to reschedule content');
      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.rescheduleContent(contentId, newPublishAt)).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.rescheduleContent',
          contentId,
          newPublishAt: newPublishAt.toISOString(),
        },
      });
    });

    it('should throw an error if scheduled content is not found', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const newPublishAt = new Date();
      vi.mocked(ScheduledContentModel.findByIdAndUpdate).mockResolvedValue(null);

      // Act & Assert
      await expect(schedulingService.rescheduleContent(contentId, newPublishAt)).rejects.toThrow(
        `Scheduled content with id ${contentId} not found`
      );
    });
  });

  describe('getScheduledContentById', () => {
    it('should get scheduled content by ID', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const mockScheduledContent = {
        _id: new Types.ObjectId(),
        type: 'post',
        content: 'content-id',
        authorId: 'author-id',
        publishAt: new Date(),
        status: BlogPostStatus.SCHEDULED,
        timezone: 'UTC',
        version: 1,
      };

      vi.mocked(ScheduledContentModel.findById).mockResolvedValue(mockScheduledContent as any);

      // Act
      const result = await schedulingService.getScheduledContentById(contentId);

      // Assert
      expect(ScheduledContentModel.findById).toHaveBeenCalledWith(contentId);
      expect(result).toEqual({
        id: mockScheduledContent._id.toString(),
        type: mockScheduledContent.type,
        content: mockScheduledContent.content,
        authorId: mockScheduledContent.authorId,
        publishAt: mockScheduledContent.publishAt,
        status: mockScheduledContent.status,
        timezone: mockScheduledContent.timezone,
        version: mockScheduledContent.version,
      });
    });

    it('should return null if scheduled content is not found', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      vi.mocked(ScheduledContentModel.findById).mockResolvedValue(null);

      // Act
      const result = await schedulingService.getScheduledContentById(contentId);

      // Assert
      expect(ScheduledContentModel.findById).toHaveBeenCalledWith(contentId);
      expect(result).toBeNull();
    });

    it('should handle errors when getting scheduled content by ID', async () => {
      // Arrange
      const contentId = new Types.ObjectId().toString();
      const error = new Error('Failed to get scheduled content');
      vi.mocked(ScheduledContentModel.findById).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.getScheduledContentById(contentId)).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.getScheduledContentById',
          contentId,
        },
      });
    });
  });

  describe('getScheduledContentByAuthor', () => {
    it('should get scheduled content by author', async () => {
      // Arrange
      const authorId = new Types.ObjectId().toString();
      const mockScheduledContent = [
        {
          _id: new Types.ObjectId(),
          type: 'post',
          content: 'content-id-1',
          authorId,
          publishAt: new Date(),
          status: BlogPostStatus.SCHEDULED,
          timezone: 'UTC',
          version: 1,
        },
        {
          _id: new Types.ObjectId(),
          type: 'comment',
          content: 'content-id-2',
          authorId,
          publishAt: new Date(),
          status: BlogPostStatus.SCHEDULED,
          timezone: 'UTC',
          version: 1,
        },
      ];

      vi.mocked(ScheduledContentModel.find).mockResolvedValue(mockScheduledContent as any[]);

      // Act
      const result = await schedulingService.getScheduledContentByAuthor(authorId);

      // Assert
      expect(ScheduledContentModel.find).toHaveBeenCalledWith({ authorId });
      expect(result).toEqual(
        mockScheduledContent.map((content) => ({
          id: content._id.toString(),
          type: content.type,
          content: content.content,
          authorId: content.authorId,
          publishAt: content.publishAt,
          status: content.status,
          timezone: content.timezone,
          version: content.version,
        }))
      );
    });

    it('should handle errors when getting scheduled content by author', async () => {
      // Arrange
      const authorId = new Types.ObjectId().toString();
      const error = new Error('Failed to get scheduled content by author');
      vi.mocked(ScheduledContentModel.find).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.getScheduledContentByAuthor(authorId)).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.getScheduledContentByAuthor',
          authorId,
        },
      });
    });
  });

  describe('getScheduledContent', () => {
    it('should get all scheduled content', async () => {
      // Arrange
      const mockScheduledContent = [
        {
          _id: new Types.ObjectId(),
          type: 'post',
          content: 'content-id-1',
          authorId: 'author-id-1',
          publishAt: new Date(),
          status: BlogPostStatus.SCHEDULED,
          timezone: 'UTC',
          version: 1,
        },
        {
          _id: new Types.ObjectId(),
          type: 'comment',
          content: 'content-id-2',
          authorId: 'author-id-2',
          publishAt: new Date(),
          status: BlogPostStatus.SCHEDULED,
          timezone: 'UTC',
          version: 1,
        },
      ];

      vi.mocked(ScheduledContentModel.find).mockResolvedValue(mockScheduledContent as any[]);

      // Act
      const result = await schedulingService.getScheduledContent();

      // Assert
      expect(ScheduledContentModel.find).toHaveBeenCalledWith({
        status: BlogPostStatus.SCHEDULED,
        publishAt: { $lte: expect.any(Date) },
      });
      expect(result).toEqual(
        mockScheduledContent.map((content) => ({
          id: content._id.toString(),
          type: content.type,
          content: content.content,
          authorId: content.authorId,
          publishAt: content.publishAt,
          status: content.status,
          timezone: content.timezone,
          version: content.version,
        }))
      );
    });

    it('should handle errors when getting all scheduled content', async () => {
      // Arrange
      const error = new Error('Failed to get all scheduled content');
      vi.mocked(ScheduledContentModel.find).mockRejectedValue(error);

      // Act & Assert
      await expect(schedulingService.getScheduledContent()).rejects.toThrow();
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(error, {
        category: 'database',
        context: {
          operation: 'SchedulingService.getScheduledContent',
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('getDefaultDelayHours', () => {
    it('should return the default delay hours', () => {
      // Act
      const result = schedulingService.getDefaultDelayHours();

      // Assert
      expect(result).toBe(24);
    });
  });

  describe('setDefaultDelayHours', () => {
    it('should set the default delay hours', () => {
      // Arrange
      const hours = 48;

      // Act
      schedulingService.setDefaultDelayHours(hours);

      // Assert
      expect(schedulingService.getDefaultDelayHours()).toBe(hours);
    });
  });
});
