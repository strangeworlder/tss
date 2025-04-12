<!--
ContentList.vue
Component name: ContentList
Description: Content list view for authors
Features:
- Content list with status indicators
- Filtering and sorting
- Bulk actions
- Accessibility compliant
Usage:
<template>
  <ContentList :items="contentItems" />
</template>
Props:
- items: IContentItem[] - Array of content items to display
Accessibility:
- Proper table structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->

<template>
  <div class="content-list">
    <div class="content-list__header">
      <h2 class="content-list__title">Content List</h2>
      <div class="content-list__actions">
        <div class="content-list__bulk-actions">
          <button
            class="content-list__action"
            @click="handleBulkStatusChange('published')"
            :disabled="!hasSelectedItems"
            aria-label="Publish selected items"
          >
            Publish Selected
          </button>
          <button
            class="content-list__action"
            @click="handleBulkStatusChange('archived')"
            :disabled="!hasSelectedItems"
            aria-label="Archive selected items"
          >
            Archive Selected
          </button>
          <button
            class="content-list__action"
            @click="handleBulkDelete"
            :disabled="!hasSelectedItems"
            aria-label="Delete selected items"
          >
            Delete Selected
          </button>
        </div>
      </div>
    </div>

    <div class="content-list__filters">
      <div class="content-list__filter">
        <label for="search" class="content-list__filter-label">Search</label>
        <input
          id="search"
          v-model="searchQuery"
          type="search"
          class="content-list__search-input"
          placeholder="Search by title or content..."
          aria-label="Search content"
        />
      </div>

      <div class="content-list__filter">
        <label for="status-filter" class="content-list__filter-label">Status</label>
        <select
          id="status-filter"
          v-model="filters.status"
          class="content-list__filter-select"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <div class="content-list__filter">
        <label for="type-filter" class="content-list__filter-label">Type</label>
        <select
          id="type-filter"
          v-model="filters.type"
          class="content-list__filter-select"
          aria-label="Filter by content type"
        >
          <option value="">All Types</option>
          <option v-for="type in types" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div class="content-list__filter">
        <label for="sort-by" class="content-list__filter-label">Sort By</label>
        <select
          id="sort-by"
          v-model="sortBy"
          class="content-list__filter-select"
          aria-label="Sort content"
        >
          <option value="date">Date</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
      </div>
    </div>

    <div class="content-list__table-container">
      <table class="content-list__table">
        <thead>
          <tr>
            <th class="content-list__header-cell">
              <input
                type="checkbox"
                v-model="selectAll"
                aria-label="Select all items"
              />
            </th>
            <th class="content-list__header-cell">Title</th>
            <th class="content-list__header-cell">Type</th>
            <th class="content-list__header-cell">Status</th>
            <th class="content-list__header-cell">Date</th>
            <th class="content-list__header-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredItems"
            :key="item.id"
            class="content-list__row"
            :class="{ 'content-list__row--selected': selectedItems.includes(item.id) }"
          >
            <td class="content-list__cell">
              <input
                type="checkbox"
                v-model="selectedItems"
                :value="item.id"
                :aria-label="`Select ${item.title}`"
              />
            </td>
            <td class="content-list__cell">
              <router-link
                :to="`/author/content/${item.id}`"
                class="content-list__link"
              >
                {{ item.title }}
              </router-link>
            </td>
            <td class="content-list__cell">{{ item.type }}</td>
            <td class="content-list__cell">
              <span
                class="content-list__status"
                :class="`content-list__status--${item.status}`"
              >
                {{ item.status }}
              </span>
            </td>
            <td class="content-list__cell">{{ formatDate(item.date) }}</td>
            <td class="content-list__cell">
              <div class="content-list__actions">
                <button
                  class="content-list__action"
                  @click="handleEdit(item)"
                  aria-label="Edit content"
                >
                  Edit
                </button>
                <button
                  class="content-list__action"
                  @click="handleDelete(item)"
                  aria-label="Delete content"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="content-list__pagination">
      <button
        class="content-list__pagination-button"
        @click="previousPage"
        :disabled="currentPage === 1"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span class="content-list__pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        class="content-list__pagination-button"
        @click="nextPage"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import { formatShortDate } from '@/utils/date';

interface IContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  date: Date;
}

// Props
const props = defineProps<{
  items: IContentItem[];
}>();

// State
const filters = ref({
  status: '',
  type: '',
});
const searchQuery = ref('');
const sortBy = ref('date');
const selectedItems = ref<string[]>([]);
const currentPage = ref(1);
const itemsPerPage = 10;

// Constants
const statuses = ['draft', 'scheduled', 'published', 'archived'];
const types = ['post', 'page', 'media'];

// Store
const blogStore = useBlogStore();
const router = useRouter();

// Computed
const selectAll = computed({
  get: () => selectedItems.value.length === props.items.length,
  set: (value: boolean) => {
    selectedItems.value = value ? props.items.map((item) => item.id) : [];
  },
});

const hasSelectedItems = computed(() => selectedItems.value.length > 0);

const filteredItems = computed(() => {
  let result = [...props.items];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (item) => item.title.toLowerCase().includes(query) || item.type.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (filters.value.status) {
    result = result.filter((item) => item.status === filters.value.status);
  }

  // Apply type filter
  if (filters.value.type) {
    result = result.filter((item) => item.type === filters.value.type);
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return b.date.getTime() - a.date.getTime();
    }
  });

  return result;
});

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});

// Methods
const handleBulkStatusChange = (status: string) => {
  // TODO: Implement bulk status change using blogStore
  selectedItems.value = [];
};

const handleBulkDelete = () => {
  if (confirm('Are you sure you want to delete the selected items?')) {
    // TODO: Implement bulk delete using blogStore
    selectedItems.value = [];
  }
};

const handleEdit = (item: IContentItem) => {
  // Navigate to edit page
  router.push(`/author/content/${item.id}/edit`);
};

const handleDelete = (item: IContentItem) => {
  if (confirm('Are you sure you want to delete this item?')) {
    // TODO: Implement delete using blogStore
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

const formatDate = (date: Date) => formatShortDate(date);
</script>

<style scoped>
.content-list {
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.content-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.content-list__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.content-list__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.content-list__bulk-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.content-list__action {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.content-list__action:hover:not(:disabled) {
  background-color: var(--color-primary-50);
}

.content-list__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content-list__filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.content-list__filter {
  flex: 1;
}

.content-list__filter-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.content-list__search-input,
.content-list__filter-select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
}

.content-list__table-container {
  overflow-x: auto;
  margin-bottom: var(--spacing-md);
}

.content-list__table {
  width: 100%;
  border-collapse: collapse;
}

.content-list__header-cell,
.content-list__cell {
  padding: var(--spacing-sm);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.content-list__header-cell {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.content-list__row:hover {
  background-color: var(--color-primary-50);
}

.content-list__row--selected {
  background-color: var(--color-primary-100);
}

.content-list__link {
  color: var(--color-primary);
  text-decoration: none;
}

.content-list__link:hover {
  text-decoration: underline;
}

.content-list__status {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.content-list__status--draft {
  background-color: var(--color-warning-100);
  color: var(--color-warning-900);
}

.content-list__status--scheduled {
  background-color: var(--color-info-100);
  color: var(--color-info-900);
}

.content-list__status--published {
  background-color: var(--color-success-100);
  color: var(--color-success-900);
}

.content-list__status--archived {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.content-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
}

.content-list__pagination-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.content-list__pagination-button:hover:not(:disabled) {
  background-color: var(--color-primary-50);
}

.content-list__pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content-list__pagination-info {
  color: var(--color-text-secondary);
}
</style> 