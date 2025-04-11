import { Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import type { IUser } from '../types/user';
import type { IBlogPost, PostStatus, ModerationStatus } from '../domains/blog/types/BlogTypes';
import type { IComment, CommentStatus as CommentStatusType } from '../domains/blog/types/CommentTypes';
import { type INotification, NotificationType } from '../types/notification';
import type { INotificationPreferences } from '../models/NotificationPreferencesModel';

/**
 * Creates a mock user for testing
 * @param overrides - Properties to override in the default user
 * @returns A mock user object
 */
export const createMockUser = (overrides: Partial<IUser> = {}): IUser => ({
  id: new Types.ObjectId().toString(),
  email: faker.internet.email(),
  username: faker.internet.userName(),
  isAdmin: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Creates a mock blog post for testing
 * @param overrides - Properties to override in the default blog post
 * @returns A mock blog post object
 */
export const createMockBlogPost = (overrides: Partial<IBlogPost> = {}): IBlogPost => ({
  _id: new Types.ObjectId(),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraph(),
  excerpt: faker.lorem.sentences(2),
  author: new Types.ObjectId(),
  status: 'draft' as PostStatus,
  publishAt: null,
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  timezone: 'UTC',
  version: 1,
  pendingUpdateId: null,
  hasActiveUpdate: false,
  originalPostId: null,
  moderationStatus: 'pending' as ModerationStatus,
  abuseScore: 0,
  lastModeratedAt: null,
  ...overrides,
});

/**
 * Creates a mock comment for testing
 * @param overrides - Properties to override in the default comment
 * @returns A mock comment object
 */
export const createMockComment = (overrides: Partial<IComment> = {}): IComment => ({
  _id: new Types.ObjectId(),
  postId: new Types.ObjectId(),
  author: new Types.ObjectId(),
  content: faker.lorem.paragraph(),
  status: 'pending' as CommentStatusType,
  publishAt: null,
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  timezone: 'UTC',
  version: 1,
  pendingUpdateId: null,
  hasActiveUpdate: false,
  originalCommentId: null,
  moderationStatus: 'pending' as CommentStatusType,
  abuseScore: 0,
  lastModeratedAt: null,
  ...overrides,
});

/**
 * Creates a mock notification for testing
 * @param overrides - Properties to override in the default notification
 * @returns A mock notification object
 */
export const createMockNotification = (overrides: Partial<INotification> = {}): INotification => {
  const objectId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const contentId = new Types.ObjectId();

  return {
    id: objectId.toHexString(),
    userId: userId.toHexString(),
    type: NotificationType.CONTENT_SCHEDULED,
    title: faker.lorem.sentence(),
    message: faker.lorem.paragraph(),
    contentId: contentId.toHexString(),
    contentType: 'post',
    read: false,
    metadata: {
      publishAt: new Date(),
      actionUrl: faker.internet.url(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    ...overrides,
  };
};

/**
 * Creates mock notification preferences
 * @param overrides - Custom properties to override defaults
 * @returns Mock notification preferences object
 */
export function createMockNotificationPreferences(
  overrides: Partial<INotificationPreferences> = {}
): INotificationPreferences {
  // Create an object with all notification types set to true
  const allNotificationTypes = Object.values(NotificationType).reduce(
    (acc, type) => {
      acc[type] = true;
      return acc;
    },
    {} as Record<NotificationType, boolean>
  );

  // Create the base mock object with required properties
  const mockPreferences = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId().toString(), // Convert ObjectId to string
    emailNotifications: true,
    inAppNotifications: true,
    emailFrequency: 'immediate',
    emailTypes: [
      NotificationType.CONTENT_SCHEDULED,
      NotificationType.CONTENT_PUBLISHED,
      NotificationType.CONTENT_PUBLICATION_FAILED,
      NotificationType.SYSTEM_ERROR
    ],
    notificationTypes: allNotificationTypes,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  // Add required Mongoose document methods
  return {
    ...mockPreferences,
    save: () => Promise.resolve(mockPreferences as INotificationPreferences),
    toObject: () => ({
      userId: mockPreferences.userId,
      emailNotifications: mockPreferences.emailNotifications,
      inAppNotifications: mockPreferences.inAppNotifications,
      emailFrequency: mockPreferences.emailFrequency,
      emailTypes: mockPreferences.emailTypes,
      notificationTypes: mockPreferences.notificationTypes,
      createdAt: mockPreferences.createdAt,
      updatedAt: mockPreferences.updatedAt
    })
  } as INotificationPreferences;
}

/**
 * Creates an array of mock objects
 * @param factory - Function to create a single mock object
 * @param count - Number of objects to create
 * @param overrides - Properties to override in each object
 * @returns Array of mock objects
 */
export function createMockArray<T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: Partial<T>
): T[] {
  return Array.from({ length: count }, () => factory(overrides));
}

/**
 * Mocks a service with Jest
 * @param servicePath - Path to the service to mock
 * @param mockImplementation - Mock implementation of the service
 */
export function mockService(
  servicePath: string,
  mockImplementation: Record<string, jest.Mock>
): void {
  jest.mock(servicePath, () => mockImplementation);
}

/**
 * Creates a mock Express request object
 * @param overrides - Properties to override in the default request
 * @returns A mock Express request object
 */
export function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    cookies: {},
    session: {},
    user: null,
    ...overrides,
  };
}

/**
 * Creates a mock Express response object
 * @returns A mock Express response object
 */
export function createMockResponse() {
  const res: Record<string, any> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Creates a mock Express next function
 * @returns A mock Express next function
 */
export function createMockNext() {
  return jest.fn();
}
