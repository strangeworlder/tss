<!--
@component OfflineContentList
@description A component that displays a list of offline content items with their previews and management options.

@features
- Displays a list of offline content items
- Shows content previews using OfflineContentPreview
- Provides filtering and sorting options
- Shows empty state when no content is available
- Handles content management actions

@props {
  filter: string (optional) - Filter content by type ('post' | 'comment' | 'all')
  sortBy: string (optional) - Sort content by field ('date' | 'status' | 'type')
  initialSortOrder: 'asc' | 'desc' (optional) - Initial sort order
}

@events {
  edit: {
    description: "Emitted when an item's edit button is clicked"
    payload: string (content ID)
  }
  delete: {
    description: "Emitted when an item's delete button is clicked"
    payload: string (content ID)
  }
  retry: {
    description: "Emitted when an item's retry button is clicked"
    payload: string (content ID)
  }
  resolveConflict: {
    description: "Emitted when a conflict resolution option is selected"
    payload: { contentId: string, resolution: 'local' | 'server' }
  }
}

@accessibility
- Uses semantic HTML elements
- Provides ARIA labels for interactive elements
- Maintains proper heading hierarchy
- Ensures keyboard navigation
- Announces status changes
-->

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IOfflineContent } from '@/services/OfflineStorageService';
import { useOfflineStorage } from '@/composables/useOfflineStorage';
import OfflineContentPreview from '@/components/molecules/OfflineContentPreview.vue';
import AppSelect from '@/components/atoms/AppSelect.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';

const props = withDefaults(
  defineProps<{
    filter?: 'post' | 'comment' | 'all';
    sortBy?: 'date' | 'status' | 'type';
    initialSortOrder?: 'asc' | 'desc';
  }>(),
  {
    filter: 'all',
    sortBy: 'date',
    initialSortOrder: 'desc',
  }
);

const sortOrder = ref(props.initialSortOrder);

const emit = defineEmits<{
  (e: 'edit', contentId: string): void;
  (e: 'delete', contentId: string): void;
  (e: 'retry', contentId: string): void;
  (e: 'resolveConflict', payload: { contentId: string; resolution: 'local' | 'server' }): void;
}>();

const offlineStorage = useOfflineStorage();

const filteredContent = computed(() => {
  let content = offlineStorage.getAllOfflineContent();

  // Apply filter
  if (props.filter !== 'all') {
    content = content.filter((item: IOfflineContent) => item.type === props.filter);
  }

  // Apply sorting
  content = [...content].sort((a, b) => {
    let comparison = 0;

    switch (props.sortBy) {
      case 'date':
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        break;
      case 'status':
        comparison = a.syncStatus.localeCompare(b.syncStatus);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortOrder.value === 'asc' ? comparison : -comparison;
  });

  return content;
});

const hasContent = computed(() => filteredContent.value.length > 0);

const handleEdit = (contentId: string) => {
  emit('edit', contentId);
};

const handleDelete = (contentId: string) => {
  emit('delete', contentId);
};

const handleRetry = (contentId: string) => {
  emit('retry', contentId);
};

const handleResolveConflict = (payload: { contentId: string; resolution: 'local' | 'server' }) => {
  emit('resolveConflict', payload);
};
</script>

<template>
  <div class="offline-content-list">
    <div class="offline-content-list__header">
      <h2 class="offline-content-list__title">Offline Content</h2>
      
      <div class="offline-content-list__filters">
        <AppSelect
          v-model="filter"
          :options="[
            { value: 'all', label: 'All Content' },
            { value: 'post', label: 'Posts' },
            { value: 'comment', label: 'Comments' },
          ]"
          label="Filter by type"
        />
        
        <AppSelect
          v-model="sortBy"
          :options="[
            { value: 'date', label: 'Date' },
            { value: 'status', label: 'Status' },
            { value: 'type', label: 'Type' },
          ]"
          label="Sort by"
        />
        
        <AppButton
          :variant="ButtonVariantEnum.SECONDARY"
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
        >
          {{ sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending' }}
        </AppButton>
      </div>
    </div>

    <div v-if="hasContent" class="offline-content-list__content">
      <OfflineContentPreview
        v-for="content in filteredContent"
        :key="content.id"
        :content="content"
        @edit="handleEdit"
        @delete="handleDelete"
        @retry="handleRetry"
        @resolve-conflict="handleResolveConflict"
      />
    </div>

    <div v-else class="offline-content-list__empty">
      <p>No offline content available.</p>
    </div>
  </div>
</template>

<style scoped>
.offline-content-list {
  padding: var(--spacing-md);
}

.offline-content-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.offline-content-list__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.offline-content-list__filters {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.offline-content-list__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.offline-content-list__empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}
</style> 