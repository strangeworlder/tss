/**
 * Blog Store
 * Central state management for blog posts
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IBlogPost, Author } from '@/types/blog';
import { BlogPostStatus, BlogPostModerationStatus } from '@/types/blog';
import { useNotificationStore } from '@/stores/notification';
import { useUpdateStore } from '@/stores/update';
import { useOfflineStorage } from '@/composables/useOfflineStorage';
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import type { IScheduledContent } from '@/types/content';
import type { IOfflineContent } from '@/types/offline';
import { apiGet, apiPut, apiPost } from '@/api/apiClient';

interface IParsedContent {
  content: string;
  title: string;
}

interface IContentMetadata {
  slug: string;
  excerpt: string;
  timezone: string;
  moderationStatus: BlogPostModerationStatus;
  abuseScore: number;
  lastModeratedAt?: string;
}

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<IBlogPost[]>([]);
  const currentPost = ref<IBlogPost | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const notificationStore = useNotificationStore();
  const updateStore = useUpdateStore();
  const offlineStorage = useOfflineStorage();
  const networkStatus = useNetworkStatus();

  // Computed properties
  const postsByTag = computed(() => {
    const tagMap = new Map<string, IBlogPost[]>();

    for (const post of posts.value) {
      for (const tag of post.tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)?.push(post);
      }
    }

    return tagMap;
  });

  // Helper function to validate and convert metadata
  const convertMetadata = (metadata: unknown): IContentMetadata => {
    if (!metadata || typeof metadata !== 'object') {
      return {
        slug: '',
        excerpt: '',
        timezone: 'UTC',
        moderationStatus: BlogPostModerationStatus.PENDING,
        abuseScore: 0,
        lastModeratedAt: undefined,
      };
    }

    const meta = metadata as Record<string, unknown>;
    return {
      slug: typeof meta.slug === 'string' ? meta.slug : '',
      excerpt: typeof meta.excerpt === 'string' ? meta.excerpt : '',
      timezone: typeof meta.timezone === 'string' ? meta.timezone : 'UTC',
      moderationStatus:
        typeof meta.moderationStatus === 'string'
          ? (meta.moderationStatus as BlogPostModerationStatus)
          : BlogPostModerationStatus.PENDING,
      abuseScore: typeof meta.abuseScore === 'number' ? meta.abuseScore : 0,
      lastModeratedAt: typeof meta.lastModeratedAt === 'string' ? meta.lastModeratedAt : undefined,
    };
  };

  // Helper function to convert blog post to scheduled content
  const convertToScheduledContent = (post: IBlogPost): IScheduledContent => ({
    id: post.id,
    title: post.title,
    content: post.content,
    publishAt: new Date(post.publishAt || post.publishedAt || new Date()),
    status:
      post.status === BlogPostStatus.SCHEDULED
        ? 'scheduled'
        : post.status === BlogPostStatus.PUBLISHED
          ? 'published'
          : 'draft',
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    authorId: typeof post.author === 'string' ? post.author : post.author.id || '',
    tags: post.tags,
    metadata: {
      slug: post.slug,
      excerpt: post.excerpt,
      timezone: post.timezone,
      moderationStatus: post.moderationStatus,
      abuseScore: post.abuseScore,
      lastModeratedAt: post.lastModeratedAt,
    },
  });

  // Helper function to convert scheduled content to blog post
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

    return {
      id: content.id,
      title: postTitle,
      content: postContent,
      slug: metadata.slug,
      excerpt: metadata.excerpt,
      status:
        content.status === 'scheduled'
          ? BlogPostStatus.SCHEDULED
          : content.status === 'published'
            ? BlogPostStatus.PUBLISHED
            : BlogPostStatus.DRAFT,
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
      isPublished: content.status === 'published',
      moderationStatus: metadata.moderationStatus,
      abuseScore: metadata.abuseScore,
      lastModeratedAt: metadata.lastModeratedAt,
    };
  };

  // Helper function to convert scheduled content to offline content
  const convertToOfflineContent = (content: IScheduledContent): IOfflineContent => ({
    id: content.id,
    type: 'post',
    content: JSON.stringify({
      title: content.title,
      content: content.content,
    }),
    publishAt: content.publishAt,
    status:
      content.status === 'scheduled'
        ? 'scheduled'
        : content.status === 'published'
          ? 'published'
          : 'failed',
    authorId: content.authorId,
    version: 1,
    hasActiveUpdate: false,
    lastModified: content.updatedAt,
    syncStatus: 'pending',
    retryCount: 0,
    maxRetries: 3,
  });

  // Actions
  const fetchPosts = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Check if we're offline
      if (!networkStatus.online.value) {
        // Get posts from offline storage
        const offlinePosts = offlineStorage.getAllOfflineContent();
        posts.value = offlinePosts
          .filter((content: IOfflineContent) => content.type === 'post')
          .map((content: IOfflineContent) => convertToBlogPost(content));
        return;
      }

      // Online mode - fetch from server
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      // Using correct endpoint as per API documentation
      const url = `${apiBaseUrl}/v1/blog`;
      
      console.log('Fetching posts from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to get more error details
        let errorMessage = 'Failed to fetch posts';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (e) {
          // If can't parse JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
          } catch (textError) {
            // Fallback to default message
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API response structure:', Object.keys(data));
      
      // Use data.data instead of data.posts based on the actual API response structure
      posts.value = data.data;

      // Store posts in offline storage
      for (const post of data.data) {
        offlineStorage.storeContent(convertToScheduledContent(post));
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching posts';
      notificationStore.addNotification({
        type: 'error',
        message: error.value,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAdminPosts = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Check if we're offline
      if (!networkStatus.online.value) {
        // Get admin posts from offline storage
        const offlinePosts = offlineStorage.getAllOfflineContent();
        posts.value = offlinePosts
          .filter(
            (content: IOfflineContent) =>
              content.type === 'post' && JSON.parse(content.content).author.id === 'admin'
          )
          .map((content: IOfflineContent) => convertToBlogPost(content));
        return;
      }

      // Online mode - fetch from server using apiGet with proper auth
      try {
        const response = await apiGet<any>('/v1/blog/admin/all');
        
        console.log('Admin posts API response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch admin posts');
        }
        
        // Use data from the response
        posts.value = response.data;

        // Store posts in offline storage
        for (const post of response.data) {
          offlineStorage.storeContent(convertToScheduledContent(post));
        }
      } catch (apiError) {
        console.error('Error fetching admin posts:', apiError);
        throw apiError;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'An error occurred while fetching admin posts';
      notificationStore.addNotification({
        type: 'error',
        message: error.value,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPostBySlug = async (slug: string): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Check if we're offline
      if (!networkStatus.online.value) {
        // Get post from offline storage
        const offlinePosts = offlineStorage.getAllOfflineContent();
        const post = offlinePosts.find(
          (content: IOfflineContent) =>
            content.type === 'post' && JSON.parse(content.content).slug === slug
        );

        if (post) {
          currentPost.value = convertToBlogPost(post);
        } else {
          throw new Error('Post not found in offline storage');
        }
        return;
      }

      // Online mode - fetch from server
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      // Using correct endpoint as per API documentation
      const url = `${apiBaseUrl}/v1/blog/${slug}`;
      
      console.log('Fetching post by slug from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to get more error details
        let errorMessage = 'Failed to fetch post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (e) {
          // If can't parse JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
          } catch (textError) {
            // Fallback to default message
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Use data.data instead of data.post based on the actual API response structure
      currentPost.value = data.data;

      // Store post in offline storage
      offlineStorage.storeContent(convertToScheduledContent(data.data));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching post';
      notificationStore.addNotification({
        type: 'error',
        message: error.value,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPostById = async (id: string): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Check if we're offline
      if (!networkStatus.online.value) {
        // Get post from offline storage
        const offlinePosts = offlineStorage.getAllOfflineContent();
        const post = offlinePosts.find(
          (content: IOfflineContent) => content.type === 'post' && content.id === id
        );

        if (post) {
          currentPost.value = convertToBlogPost(post);
        } else {
          throw new Error('Post not found in offline storage');
        }
        return;
      }

      // Online mode - fetch from server
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      // Using correct endpoint as per API documentation
      const url = `${apiBaseUrl}/v1/blog/id/${id}`;
      
      console.log('Fetching post by ID from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to get more error details
        let errorMessage = 'Failed to fetch post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (e) {
          // If can't parse JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
          } catch (textError) {
            // Fallback to default message
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Use data.data instead of data.post based on the actual API response structure
      currentPost.value = data.data;

      // Store post in offline storage
      offlineStorage.storeContent(convertToScheduledContent(data.data));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching post';
      notificationStore.addNotification({
        type: 'error',
        message: error.value,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPostsByTag = async (tag: string): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Check if we're offline
      if (!networkStatus.online.value) {
        // Get posts from offline storage
        const offlinePosts = offlineStorage.getAllOfflineContent();
        posts.value = offlinePosts
          .filter(
            (content: IOfflineContent) =>
              content.type === 'post' && JSON.parse(content.content).tags.includes(tag)
          )
          .map((content: IOfflineContent) => convertToBlogPost(content));
        return;
      }

      // Online mode - fetch from server
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      // Using correct endpoint as per API documentation
      const url = `${apiBaseUrl}/v1/blog/tag/${tag}`;
      
      console.log('Fetching posts by tag from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to get more error details
        let errorMessage = 'Failed to fetch posts by tag';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (e) {
          // If can't parse JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
          } catch (textError) {
            // Fallback to default message
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Use data.data instead of data.posts based on the actual API response structure
      posts.value = data.data;

      // Store posts in offline storage
      for (const post of data.data) {
        offlineStorage.storeContent(convertToScheduledContent(post));
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'An error occurred while fetching posts by tag';
      notificationStore.addNotification({
        type: 'error',
        message: error.value,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const createPost = async (post: Partial<IBlogPost> | FormData): Promise<IBlogPost | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Check if we're offline
      if (!networkStatus.online.value) {
        // FormData can't be processed offline
        if (post instanceof FormData) {
          throw new Error('Cannot create post with images while offline');
        }

        // Create a temporary ID
        const tempId = `temp-${Date.now()}`;

        // Create a new post object
        const newPost: IBlogPost = {
          id: tempId,
          title: post.title || 'Untitled',
          content: post.content || '',
          slug: post.slug || `untitled-${Date.now()}`,
          tags: post.tags || [],
          author: post.author || { type: 'text', name: 'Unknown Author' },
          status: BlogPostStatus.DRAFT,
          publishAt: new Date().toISOString(),
          version: 1,
          hasActiveUpdate: false,
          pendingUpdateId: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          excerpt: post.excerpt || '',
          isPublished: false,
          timezone: post.timezone || 'UTC',
          moderationStatus: BlogPostModerationStatus.PENDING,
          abuseScore: 0,
        };

        // Store in offline storage
        offlineStorage.storeContent(convertToScheduledContent(newPost));

        // Add to posts array
        posts.value.push(newPost);

        // Add to sync queue
        offlineStorage.addToSyncQueue(convertToOfflineContent(convertToScheduledContent(newPost)));

        return newPost;
      }

      // Online mode - create post with apiPost to include auth headers
      console.log('Creating post with', post instanceof FormData ? 'FormData' : 'JSON');
      
      try {
        // Using apiPost to properly include auth headers
        const response = await apiPost<IBlogPost>('/v1/blog', post);
        
        console.log('Create response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to create post');
        }
        
        // Use data from the response
        const newPost = response.data;

        // Add to posts array
        posts.value.push(newPost);

        // Store in offline storage
        offlineStorage.storeContent(convertToScheduledContent(newPost));

        return newPost;
      } catch (apiError) {
        console.error('Error creating post:', apiError);
        throw apiError;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while creating post';
      notificationStore.addNotification({
        type: 'error',
        message: error.value,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updatePost = async (id: string, post: Partial<IBlogPost> | FormData): Promise<IBlogPost | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Check if we're offline
      if (!networkStatus.online.value) {
        // FormData can't be processed offline
        if (post instanceof FormData) {
          throw new Error('Cannot update post with images while offline');
        }

        // Get post from offline storage
        const offlinePosts = offlineStorage.getAllOfflineContent();
        const existingPost = offlinePosts.find(
          (content: IOfflineContent) => content.type === 'post' && content.id === id
        );

        if (!existingPost) {
          throw new Error('Post not found in offline storage');
        }

        // Update the post
        const updatedPost = {
          ...JSON.parse(existingPost.content),
          ...post,
          updatedAt: new Date().toISOString(),
        };

        // Store in offline storage
        offlineStorage.storeContent(convertToScheduledContent(updatedPost));

        // Update in posts array
        const index = posts.value.findIndex((p) => p.id === id);
        if (index !== -1) {
          posts.value[index] = updatedPost;
        }

        // Add to sync queue
        offlineStorage.addToSyncQueue(
          convertToOfflineContent(convertToScheduledContent(updatedPost))
        );

        return updatedPost;
      }

      // Online mode - update on server using apiPut with authentication
      console.log('Updating post with', post instanceof FormData ? 'FormData' : 'JSON');
      
      try {
        // Using apiPut to properly include auth headers
        const response = await apiPut<IBlogPost>(`/v1/blog/id/${id}`, post);
        
        console.log('Update response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to update post');
        }
        
        // Use data from the response
        const updatedPost = response.data;

        // Update in posts array
        const index = posts.value.findIndex((p) => p.id === id);
        if (index !== -1) {
          posts.value[index] = updatedPost;
        }

        // Store in offline storage
        offlineStorage.storeContent(convertToScheduledContent(updatedPost));

        return updatedPost;
      } catch (apiError) {
        console.error('Error updating post:', apiError);
        throw apiError;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while updating post';
      notificationStore.addNotification({
        type: 'error',
        message: error.value,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    posts,
    currentPost,
    isLoading,
    error,
    postsByTag,
    fetchPosts,
    fetchAdminPosts,
    fetchPostBySlug,
    fetchPostById,
    fetchPostsByTag,
    createPost,
    updatePost,
  };
});
