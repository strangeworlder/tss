import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountBlogPostList, createDefaultProps } from './BlogPostList.test-utils'
import { useBlogStore } from '@/stores/blogStore'
import { ImageSizeEnum } from '@/types/image'
import { ButtonVariantEnum } from '@/types/button'
import { mockBlogPosts } from './__fixtures__/BlogPostList.fixture'
import type { IBlogPost, IBlogPostPreview } from '@/types/blog'
import { ref } from 'vue'
import { UserRole } from '@/types/user'

// Mock the store
vi.mock('@/stores/blogStore', () => ({
  useBlogStore: vi.fn()
}))

// Helper function to create a mock store with all required Pinia properties
const createMockStore = (state: any) => ({
  ...state,
  $state: state,
  $patch: vi.fn(),
  $reset: vi.fn(),
  $subscribe: vi.fn(),
  $dispose: vi.fn(),
  $onAction: vi.fn(),
  $onPatch: vi.fn(),
  $onStateChange: vi.fn()
})

describe('BlogPostList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders loading state initially', () => {
      // Mock the store to return loading state
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>(null),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn(),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      expect(wrapper.find('.blog-post-list__loading').exists()).toBe(true)
      expect(wrapper.find('.blog-post-list__spinner').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading posts...')
    })

    it('renders error state when fetch fails', async () => {
      // Mock the store to return error state
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>('Test error'),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn().mockRejectedValue(new Error('Test error')),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.blog-post-list__error').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test error')
      expect(wrapper.findComponent({ name: 'AppButton' }).props('variant')).toBe(ButtonVariantEnum.DANGER)
    })

    it('renders blog posts when data is loaded', async () => {
      // Mock the store to return posts
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>(mockBlogPosts.default),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>(null),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn(),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.blog-post-list__grid').exists()).toBe(true)
      expect(wrapper.findAll('.blog-post-list__item')).toHaveLength(mockBlogPosts.default.length)
    })
  })

  describe('props and events', () => {
    it('emits edit-post event when edit button is clicked', async () => {
      // Mock the store to return posts
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>(mockBlogPosts.default),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>(null),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn(),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      // Find and click the first edit button
      const editButton = wrapper.findAll('.blog-post-list__actions .blog-post-list__button')[0]
      await editButton.trigger('click')
      
      // Check that the event was emitted with the correct post ID
      expect(wrapper.emitted('edit-post')).toBeTruthy()
      expect(wrapper.emitted('edit-post')?.[0]).toEqual([mockBlogPosts.default[0].id])
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes for loading state', () => {
      // Mock the store to return loading state
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(true),
        error: ref<string | null>(null),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn(),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      const loadingElement = wrapper.find('.blog-post-list__loading')
      expect(loadingElement.exists()).toBe(true)
      expect(loadingElement.attributes('role')).toBe('status')
      expect(loadingElement.attributes('aria-live')).toBe('polite')
    })

    it('has proper ARIA attributes for error state', async () => {
      // Mock the store to return error state
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>('Test error'),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn().mockRejectedValue(new Error('Test error')),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      // Force the component to show error state
      await wrapper.setData({ error: 'Test error', loading: false })
      
      const errorElement = wrapper.find('.blog-post-list__error')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.attributes('role')).toBe('alert')
    })

    it('provides alt text for images', async () => {
      // Mock the store to return posts with images
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([
          {
            id: '1',
            title: 'Test Post',
            slug: 'test-post',
            excerpt: 'Test excerpt',
            author: {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: UserRole.ADMIN
            },
            heroImage: {
              filename: 'test-image.jpg',
              altText: 'Test image alt text'
            },
            tags: ['test'],
            isPublished: true
          }
        ]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>(null),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn(),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      // Force the component to show posts
      await wrapper.setData({ loading: false, error: null })
      
      // Find the first image
      const image = wrapper.findComponent({ name: 'AppImage' })
      expect(image.exists()).toBe(true)
      expect(image.props('alt')).toBe('Test image alt text')
    })
  })

  describe('responsive behavior', () => {
    it('renders posts in a responsive grid', async () => {
      // Mock the store to return posts
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([
          {
            id: '1',
            title: 'Test Post',
            slug: 'test-post',
            excerpt: 'Test excerpt',
            author: {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: UserRole.ADMIN
            },
            heroImage: {
              filename: 'test-image.jpg',
              altText: 'Test image alt text'
            },
            tags: ['test'],
            isPublished: true
          }
        ]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>(null),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn(),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      // Force the component to show posts
      await wrapper.setData({ loading: false, error: null })
      
      const grid = wrapper.find('.blog-post-list__grid')
      expect(grid.exists()).toBe(true)
      expect(grid.attributes('style')).toContain('grid-template-columns')
    })
  })

  describe('error handling', () => {
    it('shows error message when fetch fails', async () => {
      // Mock the store to return error state
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>('Test error'),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: vi.fn().mockRejectedValue(new Error('Test error')),
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      // Force the component to show error state by directly setting the error ref
      await wrapper.setData({ error: 'Test error', loading: false })
      
      // The component should show the error message
      expect(wrapper.text()).toContain('Test error')
      
      // Find the error element by its role attribute
      const errorElement = wrapper.find('[role="alert"]')
      expect(errorElement.exists()).toBe(true)
    })

    it('allows retrying when fetch fails', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Test error')).mockResolvedValueOnce(undefined)
      
      // Mock the store to return error state initially, then success
      vi.mocked(useBlogStore).mockReturnValue(createMockStore({
        posts: ref<IBlogPostPreview[]>([]),
        currentPost: ref<IBlogPost | null>(null),
        loading: ref(false),
        error: ref<string | null>('Test error'),
        notification: ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null),
        postsByTag: vi.fn(),
        fetchPosts: vi.fn(),
        fetchAdminPosts: mockFetch,
        fetchPostBySlug: vi.fn(),
        fetchPostById: vi.fn(),
        fetchPostsByTag: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        setNotification: vi.fn(),
        clearNotification: vi.fn()
      }))

      const wrapper = mountBlogPostList(createDefaultProps())
      
      // Wait for the component to update
      await wrapper.vm.$nextTick()
      
      // Force the component to show error state by directly setting the error ref
      await wrapper.setData({ error: 'Test error', loading: false })
      
      // Find the retry button by its text content
      const retryButton = wrapper.find('button')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Try Again')
      
      // Click the retry button
      await retryButton.trigger('click')
      
      // Check that fetchAdminPosts was called again
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
}) 