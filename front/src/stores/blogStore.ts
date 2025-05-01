/**
 * Blog Store
 * Central state management for blog posts
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IBlogPost, IBlogPostPreview, IAuthor } from '@shared/types/blog';
import { BlogPostStatus, BlogPostModerationStatus } from '@shared/types/blog';
import { useNotificationStore } from '@/stores/notification';
import { useUpdateStore } from '@/stores/update';
import { useOfflineStorage } from '@/composables/useOfflineStorage';
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import type { IScheduledContent } from '@/types/content';
import type { IOfflineContent } from '@/types/offline';
import { apiGet, apiPut, apiPost, apiDelete } from '@/api/apiClient';
import { ScheduledContentStatusEnum } from '@/types/scheduling';
import { ApiEndpoints } from '@/api/apiEndpoints';

interface IParsedContent {
  title: string;
  content: string;
}

interface IMetadata {
  slug: string;
  excerpt: string;
  timezone: string;
  moderationStatus: BlogPostModerationStatus;
  abuseScore: number;
  lastModeratedAt?: string;
}

export const useBlogStore = defineStore('blog', () => {
  const notificationStore = useNotificationStore();
  const updateStore = useUpdateStore();
  const offlineStorage = useOfflineStorage();
  const networkStatus = useNetworkStatus();

  const posts = ref<IBlogPostPreview[]>([]);
  const currentPost = ref<IBlogPost | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const convertMetadata = (metadata: unknown): IMetadata => {
    if (!metadata || typeof metadata !== 'object') {
      return {
        slug: '',
        excerpt: '',
        timezone: 'UTC',
        moderationStatus: BlogPostModerationStatus.PENDING,
        abuseScore: 0,
      };
    }

    const m = metadata as Record<string, unknown>;
    return {
      slug: typeof m.slug === 'string' ? m.slug : '',
      excerpt: typeof m.excerpt === 'string' ? m.excerpt : '',
      timezone: typeof m.timezone === 'string' ? m.timezone : 'UTC',
      moderationStatus:
        typeof m.moderationStatus === 'string'
          ? (m.moderationStatus as BlogPostModerationStatus)
          : BlogPostModerationStatus.PENDING,
      abuseScore: typeof m.abuseScore === 'number' ? m.abuseScore : 0,
      lastModeratedAt: typeof m.lastModeratedAt === 'string' ? m.lastModeratedAt : undefined,
    };
  };

  const convertToScheduledContent = (post: IBlogPost): IScheduledContent => {
    const content = {
      title: post.title,
      content: post.content,
    };

    return {
      id: post.id,
      title: post.title,
      content: JSON.stringify(content),
      publishAt: new Date(post.publishAt || post.publishedAt || new Date()),
      status:
        post.status === BlogPostStatus.SCHEDULED
          ? 'scheduled'
          : post.status === BlogPostStatus.PUBLISHED
            ? 'published'
            : 'draft',
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
      authorId: typeof post.author === 'object' ? post.author.id || '' : post.author,
      tags: post.tags,
      metadata: {
        slug: post.slug,
        excerpt: post.excerpt,
        timezone: post.timezone,
        moderationStatus: post.moderationStatus,
        abuseScore: post.abuseScore,
        lastModeratedAt: post.lastModeratedAt,
      },
    };
  };

  const convertToBlogPost = (content: IScheduledContent | IOfflineContent): IBlogPost => {
    let postContent: string;
    let postTitle: string;

    if (typeof content.content === 'string') {
      const parsedContent = JSON.parse(content.content) as IParsedContent;
      postContent = parsedContent.content;
      postTitle = parsedContent.title;
    } else {
      postContent = (content.content as IParsedContent).content;
      postTitle = (content.content as IParsedContent).title;
    }

    const metadata =
      'metadata' in content && content.metadata
        ? convertMetadata(content.metadata)
        : {
            slug: '',
            excerpt: '',
            timezone: 'UTC',
            moderationStatus: BlogPostModerationStatus.PENDING,
            abuseScore: 0,
            lastModeratedAt: undefined,
          };

    const status =
      content.status === 'scheduled'
        ? BlogPostStatus.SCHEDULED
        : content.status === 'published'
          ? BlogPostStatus.PUBLISHED
          : BlogPostStatus.DRAFT;

    return {
      id: content.id,
      title: postTitle,
      content: postContent,
      slug: metadata.slug,
      excerpt: metadata.excerpt,
      status,
      version: 'version' in content ? content.version : 1,
      hasActiveUpdate: 'hasActiveUpdate' in content ? content.hasActiveUpdate : false,
      pendingUpdateId: 'pendingUpdateId' in content ? content.pendingUpdateId : undefined,
      publishAt:
        content.publishAt instanceof Date
          ? content.publishAt.toISOString()
          : new Date(content.publishAt).toISOString(),
      createdAt:
        'createdAt' in content ? content.createdAt.toISOString() : new Date().toISOString(),
      updatedAt:
        'updatedAt' in content ? content.updatedAt.toISOString() : new Date().toISOString(),
      author: {
        type: 'user',
        id: content.authorId,
        name: '', // This will be populated when the user data is loaded
      },
      tags: 'tags' in content ? content.tags || [] : [],
      timezone: metadata.timezone,
      isPublished: status === BlogPostStatus.PUBLISHED,
      moderationStatus: metadata.moderationStatus,
      abuseScore: metadata.abuseScore,
      lastModeratedAt: metadata.lastModeratedAt,
    };
  };

  const convertToOfflineContent = (content: IScheduledContent): IOfflineContent => ({
    id: content.id,
    type: 'post',
    content: content.content,
    publishAt: content.publishAt,
    status:
      content.status === 'scheduled'
        ? ScheduledContentStatusEnum.SCHEDULED
        : content.status === 'published'
          ? ScheduledContentStatusEnum.PUBLISHED
          : ScheduledContentStatusEnum.FAILED,
    authorId: content.authorId,
    version: 1,
    hasActiveUpdate: false,
    lastModified: content.updatedAt,
    syncStatus: 'pending',
    syncError: null,
    lastRetryAt: null,
    retryCount: 0,
    maxRetries: 3,
  });

  const fetchPosts = async (): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await apiGet<IBlogPostPreview[]>(ApiEndpoints.blog.getAll);
      posts.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch posts';
      notificationStore.showError('Failed to fetch posts');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPost = async (id: string): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await apiGet<IBlogPost>(ApiEndpoints.blog.getById(id));
      currentPost.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch post';
      notificationStore.showError('Failed to fetch post');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPostsByTag = async (tag: string): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await apiGet<IBlogPostPreview[]>(ApiEndpoints.blog.getByTag(tag));
      posts.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch posts';
      notificationStore.showError('Failed to fetch posts');
    } finally {
      isLoading.value = false;
    }
  };

  const createPost = async (post: IBlogPost): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await apiPost<IBlogPost>(ApiEndpoints.blog.create, post);
      currentPost.value = response.data;
      posts.value = [...posts.value, response.data];
      notificationStore.showSuccess('Post created successfully');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create post';
      notificationStore.showError('Failed to create post');
    } finally {
      isLoading.value = false;
    }
  };

  const updatePost = async (post: IBlogPost): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await apiPut<IBlogPost>(ApiEndpoints.blog.update(post.id), post);
      currentPost.value = response.data;
      const index = posts.value.findIndex((p: IBlogPostPreview) => p.id === post.id);
      if (index !== -1) {
        posts.value[index] = response.data;
      }
      notificationStore.showSuccess('Post updated successfully');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update post';
      notificationStore.showError('Failed to update post');
    } finally {
      isLoading.value = false;
    }
  };

  const deletePost = async (id: string): Promise<void> => {
    try {
      isLoading.value = true;
      await apiDelete(ApiEndpoints.blog.delete(id));
      posts.value = posts.value.filter((p: IBlogPostPreview) => p.id !== id);
      if (currentPost.value?.id === id) {
        currentPost.value = null;
      }
      notificationStore.showSuccess('Post deleted successfully');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete post';
      notificationStore.showError('Failed to delete post');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAdminPosts = async (): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await apiGet<IBlogPostPreview[]>(ApiEndpoints.blog.getAllAdmin);
      posts.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch admin posts';
      notificationStore.showError('Failed to fetch admin posts');
    } finally {
      isLoading.value = false;
    }
  };

  const postsByTag = computed(
    () => (tag: string) => posts.value.filter((post: IBlogPostPreview) => post.tags.includes(tag))
  );

  return {
    posts,
    currentPost,
    isLoading,
    error,
    fetchPosts,
    fetchPost,
    fetchPostsByTag,
    createPost,
    updatePost,
    deletePost,
    fetchAdminPosts,
    postsByTag,
  };
});
