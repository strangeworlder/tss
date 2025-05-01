/**
 * Centralized API Endpoints Configuration
 * Single source of truth for all API endpoints in the application
 * Based on the documentation in docs/api-documentation.md
 */

export const ApiEndpoints = {
  // Blog API endpoints
  blog: {
    base: 'api/v1/blog',
    getAll: 'api/v1/blog',
    getBySlug: (slug: string) => `api/v1/blog/${slug}`,
    getById: (id: string) => `api/v1/blog/id/${id}`,
    getByTag: (tag: string) => `api/v1/blog/tag/${tag}`,
    create: 'api/v1/blog',
    update: (id: string) => `api/v1/blog/id/${id}`,
    delete: (id: string) => `api/v1/blog/id/${id}`,
    getAllAdmin: 'api/v1/blog/admin/all',
  },

  // Comments API endpoints
  comments: {
    create: 'api/v1/blog/posts/comments',
    createReply: 'api/v1/blog/comments',
    getForPost: (postId: string) => `api/v1/blog/posts/${postId}/comments`,
    getReplies: (commentId: string) => `api/v1/blog/comments/${commentId}/replies`,
    updateStatus: (commentId: string) => `api/v1/blog/comments/${commentId}/status`,
    delete: (commentId: string) => `api/v1/blog/comments/${commentId}`,
  },

  // Scheduled Content API endpoints
  scheduledContent: {
    getAll: 'api/v1/scheduled-content',
    getById: (contentId: string) => `api/v1/scheduled-content/${contentId}`,
    cancel: (contentId: string) => `api/v1/scheduled-content/${contentId}/cancel`,
    retry: (contentId: string) => `api/v1/scheduled-content/${contentId}/retry`,
  },

  // Configuration API endpoints
  configuration: {
    getGlobalDelay: 'api/configuration/global-delay',
    updateGlobalDelay: 'api/configuration/global-delay',
    getContentOverride: (contentId: string) => `api/configuration/content-override/${contentId}`,
    createContentOverride: (contentId: string) => `api/configuration/content-override/${contentId}`,
    deleteContentOverride: (contentId: string) => `api/configuration/content-override/${contentId}`,
  },

  // Health API endpoints
  health: {
    check: 'api/health',
    detailed: 'api/health/detailed',
    service: (service: string) => `api/health/service/${service}`,
  },

  // Auth API endpoints
  auth: {
    login: 'api/v1/auth/login',
    register: 'api/v1/auth/register',
    refresh: 'api/v1/auth/refresh',
    logout: 'api/v1/auth/logout',
  },

  // User API endpoints
  user: {
    profile: 'api/v1/user/profile',
    updateProfile: 'api/v1/user/profile',
  },
};
