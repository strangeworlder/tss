<!--
ContentManagementView.vue
Component name: ContentManagement
Description: View for managing content
Features:
- Content list view with filtering and sorting
- Content status indicators
- Bulk actions
- Search functionality
- Pagination
- Accessibility compliant
Usage:
<template>
  <ContentManagement />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper table structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->

<template>
  <AuthorDashboardLayout title="Content Management">
    <div class="author-content-management">
      <div class="author-content-management__header">
        <div class="author-content-management__actions">
          <div class="author-content-management__search">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search content..."
              class="author-content-management__search-input"
              aria-label="Search content"
            />
          </div>

          <div class="author-content-management__filters">
            <select
              v-model="statusFilter"
              class="author-content-management__filter"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>

            <select
              v-model="typeFilter"
              class="author-content-management__filter"
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="error" class="author-content-management__error">
        {{ error }}
      </div>

      <div v-else-if="isLoading" class="author-content-management__loading">
        Loading content...
      </div>

      <div v-else class="author-content-management__content">
        <table class="author-content-management__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  v-model="selectAll"
                  aria-label="Select all content"
                />
              </th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredContent"
              :key="item.id"
              class="author-content-management__row"
            >
              <td>
                <input
                  type="checkbox"
                  v-model="selectedItems"
                  :value="item.id"
                  :aria-label="`Select ${item.title}`"
                />
              </td>
              <td>{{ item.title }}</td>
              <td>{{ item.type }}</td>
              <td>
                <span
                  class="author-content-management__status"
                  :class="`author-content-management__status--${item.status}`"
                >
                  {{ item.status }}
                </span>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
              <td>
                <div class="author-content-management__action-buttons">
                  <button
                    v-if="canEdit(item)"
                    @click="editItem(item)"
                    class="author-content-management__action-button"
                    aria-label="Edit content"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canDelete(item)"
                    @click="deleteItem(item)"
                    class="author-content-management__action-button"
                    aria-label="Delete content"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredContent.length === 0" class="author-content-management__empty">
          No content found
        </div>

        <div class="author-content-management__pagination">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="author-content-management__pagination-button"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span class="author-content-management__page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="author-content-management__pagination-button"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      <div v-if="selectedItems.length > 0" class="author-content-management__bulk-actions">
        <button
          @click="bulkDelete"
          class="author-content-management__bulk-button"
          aria-label="Delete selected items"
        >
          Delete Selected
        </button>
      </div>
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthorStore } from '@/stores/author';
import { useAuthStore } from '@/stores/authStore';
import { useBlogStore } from '@/stores/blogStore';
import { AuthorPermission } from '@/types/author';
import { BlogPostStatus } from '@/types/blog';
import type { IBlogPost } from '@/types/blog';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';

interface IContentItem {
  id: string;
  title: string;
  type: 'post' | 'comment';
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
}

const authorStore = useAuthorStore();
const authStore = useAuthStore();
const blogStore = useBlogStore();

// State
const content = ref<IContentItem[]>([]);
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');
const selectedItems = ref<string[]>([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const isLoading = ref(false);
const error = ref<string | null>(null);

// Computed
const selectAll = computed({
  get: () => selectedItems.value.length === filteredContent.value.length,
  set: (value: boolean) => {
    selectedItems.value = value ? filteredContent.value.map((item) => item.id) : [];
  },
});

const filteredContent = computed(() => {
  let result = content.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((item) => item.title.toLowerCase().includes(query));
  }

  // Apply status filter
  if (statusFilter.value) {
    result = result.filter((item) => item.status === statusFilter.value);
  }

  // Apply type filter
  if (typeFilter.value) {
    result = result.filter((item) => item.type === typeFilter.value);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredContent.value.length / itemsPerPage));

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const canEdit = (item: IContentItem) => {
  if (item.type === 'post') {
    return authorStore.hasPermission(AuthorPermission.EDIT_POST);
  }
  return authorStore.hasPermission(AuthorPermission.MANAGE_COMMENTS);
};

const canDelete = (item: IContentItem) => {
  if (item.type === 'post') {
    return authorStore.hasPermission(AuthorPermission.DELETE_POST);
  }
  return authorStore.hasPermission(AuthorPermission.MANAGE_COMMENTS);
};

const editItem = (item: IContentItem) => {
  // TODO: Implement edit functionality
  console.log('Edit item:', item);
};

const deleteItem = (item: IContentItem) => {
  // TODO: Implement delete functionality
  console.log('Delete item:', item);
};

const bulkDelete = () => {
  // TODO: Implement bulk delete functionality
  console.log('Bulk delete items:', selectedItems.value);
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Initial data fetch
const fetchContent = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Debug information
    console.log('Authentication state:', {
      authorStore: {
        isAuthenticated: authorStore.isAuthenticated,
        authorId: authorStore.author?.id,
        authorName: authorStore.author?.name,
      },
      authStore: {
        isAuthenticated: authStore.isAuthenticated,
        userId: authStore.user?.id,
        userName: authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName}` : null,
        role: authStore.user?.role,
        isAuthor: authStore.isAuthor,
      },
    });

    // Fetch posts from the blog store
    await blogStore.fetchPosts();

    // Debug the fetched posts
    console.log('Fetched posts:', blogStore.posts);

    // Transform blog posts to content items and filter by current user
    const authorPosts = blogStore.posts.filter((post: IBlogPost) => {
      console.log('Post author:', post.author);

      // If we have author store authentication, use that
      if (authorStore.isAuthenticated && authorStore.author?.id) {
        return (
          post.author &&
          ((post.author.id && post.author.id === authorStore.author.id) ||
            (post.author.type === 'user' && post.author.id === authorStore.author.id))
        );
      }

      // Otherwise fall back to regular user authentication
      if (authStore.isAuthenticated && authStore.user?.id) {
        return post.author && post.author.type === 'user' && post.author.id === authStore.user.id;
      }

      return false;
    });

    console.log('Author posts after filtering:', authorPosts);

    content.value = authorPosts.map((post: IBlogPost) => ({
      id: post.id,
      title: post.title,
      type: 'post',
      status:
        post.status === BlogPostStatus.PUBLISHED
          ? 'published'
          : post.status === BlogPostStatus.SCHEDULED
            ? 'scheduled'
            : 'draft',
      createdAt: post.createdAt,
    }));

    if (content.value.length === 0) {
      error.value = 'No content found. Create your first post to get started!';
    }
  } catch (err) {
    console.error('Error fetching content:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch content';
  } finally {
    isLoading.value = false;
  }
};

// Initialize with proper auth check
const initializeContent = async () => {
  // First try author authentication
  if (!authorStore.isAuthenticated) {
    try {
      await authorStore.checkAuth();
    } catch (error) {
      console.error('Author authentication check failed:', error);
    }
  }

  // If author auth failed, ensure regular user auth is checked
  if (!authorStore.isAuthenticated && !authStore.isAuthenticated) {
    try {
      await authStore.fetchUserData();
    } catch (error) {
      console.error('User authentication check failed:', error);
    }
  }

  // Now fetch content
  await fetchContent();
};

initializeContent();
</script>

<style scoped>
.author-content-management {
  padding: var(--spacing-md);
}

.author-content-management__header {
  margin-bottom: var(--spacing-lg);
}

.author-content-management__title {
  margin-bottom: var(--spacing-md);
}

.author-content-management__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.author-content-management__search {
  flex: 1;
}

.author-content-management__search-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}

.author-content-management__filters {
  display: flex;
  gap: var(--spacing-sm);
}

.author-content-management__filter {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}

.author-content-management__table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-lg);
}

.author-content-management__table th,
.author-content-management__table td {
  padding: var(--spacing-sm);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.author-content-management__status {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.author-content-management__status--draft {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.author-content-management__status--scheduled {
  background-color: var(--color-info-light);
  color: var(--color-info-dark);
}

.author-content-management__status--published {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.author-content-management__action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.author-content-management__action-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  cursor: pointer;
}

.author-content-management__action-button:hover {
  background-color: var(--color-background-alt);
}

.author-content-management__empty {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-muted);
}

.author-content-management__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.author-content-management__pagination-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  cursor: pointer;
}

.author-content-management__pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.author-content-management__bulk-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-top: 1px solid var(--color-border);
  text-align: right;
}

.author-content-management__bulk-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.author-content-management__bulk-button:hover {
  background-color: var(--color-danger-dark);
}
</style> 