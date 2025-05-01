<!--
DraftsView.vue
Component name: DraftsView
Description: View for managing draft content
Features:
- Draft posts list view with filtering and sorting
- Content status indicators
- Bulk actions
- Search functionality
- Pagination
- Accessibility compliant
Usage:
<template>
  <DraftsView />
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
  <AuthorDashboardLayout title="Draft Content">
    <div class="author-drafts">
      <div class="author-drafts__header">
        <div class="author-drafts__actions">
          <div class="author-drafts__search">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search drafts..."
              class="author-drafts__search-input"
              aria-label="Search drafts"
            />
          </div>

          <div class="author-drafts__filters">
            <select
              v-model="typeFilter"
              class="author-drafts__filter"
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="error" class="author-drafts__error">
        {{ error }}
      </div>

      <div v-else-if="isLoading" class="author-drafts__loading">
        Loading drafts...
      </div>

      <div v-else class="author-drafts__content">
        <table class="author-drafts__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  v-model="selectAll"
                  aria-label="Select all drafts"
                />
              </th>
              <th>Title</th>
              <th>Type</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in paginatedDrafts"
              :key="item.id"
              class="author-drafts__row"
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
              <td>{{ formatDate(item.createdAt) }}</td>
              <td>
                <div class="author-drafts__action-buttons">
                  <button
                    v-if="canEdit(item)"
                    @click="editItem(item)"
                    class="author-drafts__action-button"
                    aria-label="Edit draft"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canDelete(item)"
                    @click="deleteItem(item)"
                    class="author-drafts__action-button"
                    aria-label="Delete draft"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredDrafts.length === 0" class="author-drafts__empty">
          No drafts found. <a href="/author/content/new">Create your first draft</a>
        </div>

        <div class="author-drafts__pagination">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="author-drafts__pagination-button"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span class="author-drafts__page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="author-drafts__pagination-button"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      <div v-if="selectedItems.length > 0" class="author-drafts__bulk-actions">
        <button
          @click="bulkDelete"
          class="author-drafts__bulk-button"
          aria-label="Delete selected drafts"
        >
          Delete Selected
        </button>
      </div>
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthorStore } from '@/stores/author';
import { useAuthStore } from '@/stores/authStore';
import { useBlogStore } from '@/stores/blogStore';
import { AuthorPermission } from '@/types/author';
import { BlogPostStatus } from '@/types/blog';
import type { IBlogPost, IAuthor } from '@/types/blog';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';

interface IContentItem {
  id: string;
  title: string;
  type: 'post' | 'comment';
  status: 'draft';
  createdAt: string;
  author: IAuthor;
}

const router = useRouter();
const authorStore = useAuthorStore();
const authStore = useAuthStore();
const blogStore = useBlogStore();

// State
const drafts = ref<IContentItem[]>([]);
const searchQuery = ref('');
const typeFilter = ref('');
const selectedItems = ref<string[]>([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const isLoading = ref(false);
const error = ref<string | null>(null);

// Computed
const selectAll = computed({
  get: () =>
    selectedItems.value.length === filteredDrafts.value.length && filteredDrafts.value.length > 0,
  set: (value: boolean) => {
    selectedItems.value = value ? filteredDrafts.value.map((item) => item.id) : [];
  },
});

const filteredDrafts = computed(() => {
  let result = drafts.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((item) => item.title.toLowerCase().includes(query));
  }

  // Apply type filter
  if (typeFilter.value) {
    result = result.filter((item) => item.type === typeFilter.value);
  }

  return result;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredDrafts.value.length / itemsPerPage))
);

const paginatedDrafts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, filteredDrafts.value.length);
  return filteredDrafts.value.slice(start, end);
});

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
  router.push(`/author/content/${item.id}/edit`);
};

const deleteItem = (item: IContentItem) => {
  if (confirm('Are you sure you want to delete this draft?')) {
    blogStore
      .deletePost(item.id)
      .then(() => {
        fetchDrafts();
      })
      .catch((err: Error) => {
        error.value = err instanceof Error ? err.message : 'Failed to delete draft';
      });
  }
};

const bulkDelete = () => {
  if (confirm('Are you sure you want to delete the selected drafts?')) {
    const deletePromises = selectedItems.value.map((id) => blogStore.deletePost(id));

    Promise.all(deletePromises)
      .then(() => {
        fetchDrafts();
        selectedItems.value = [];
      })
      .catch((err: Error) => {
        error.value = err instanceof Error ? err.message : 'Failed to delete drafts';
      });
  }
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

// Fetch drafts from the blog store
const fetchDrafts = async () => {
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

    // Filter out only draft posts that belong to the current user
    const authorDrafts = blogStore.posts.filter((post: IBlogPost) => {
      // Only include true drafts:
      // - Not published (isPublished = false)
      // - Status is DRAFT
      if (post.isPublished || post.status !== BlogPostStatus.DRAFT) {
        return false;
      }

      console.log('Draft post author:', post.author);

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

    console.log('Author drafts after filtering:', authorDrafts);

    drafts.value = authorDrafts.map((post: IBlogPost) => ({
      id: post.id,
      title: post.title,
      type: 'post' as const,
      status: 'draft' as const,
      createdAt: post.createdAt,
      author: post.author,
    }));

    if (drafts.value.length === 0) {
      error.value = 'No drafts found. Create your first post to get started!';
    }
  } catch (err) {
    console.error('Error fetching drafts:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch drafts';
  } finally {
    isLoading.value = false;
  }
};

// Initialize with proper auth check
const initializeDrafts = async () => {
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

  // Now fetch drafts
  await fetchDrafts();
};

onMounted(() => {
  initializeDrafts();
});
</script>

<style scoped>
.author-drafts {
  padding: var(--spacing-md);
}

.author-drafts__header {
  margin-bottom: var(--spacing-md);
}

.author-drafts__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.author-drafts__search {
  flex: 1;
}

.author-drafts__search-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
}

.author-drafts__filters {
  min-width: 200px;
}

.author-drafts__filter {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
}

.author-drafts__error {
  color: var(--color-danger);
  padding: var(--spacing-md);
  text-align: center;
}

.author-drafts__loading {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--color-text);
}

.author-drafts__table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-md);
}

.author-drafts__table th,
.author-drafts__table td {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.author-drafts__row:hover {
  background-color: var(--color-background-alt);
}

.author-drafts__action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.author-drafts__action-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.author-drafts__action-button:hover {
  background-color: var(--color-background-alt);
}

.author-drafts__empty {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text);
}

.author-drafts__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.author-drafts__pagination-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.author-drafts__pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.author-drafts__page-info {
  color: var(--color-text);
}

.author-drafts__bulk-actions {
  margin-top: var(--spacing-md);
  text-align: right;
}

.author-drafts__bulk-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.author-drafts__bulk-button:hover {
  background-color: var(--color-background-alt);
}
</style> 