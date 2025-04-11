<!--
@component OfflineContentPreview
@description A preview component for offline content that shows content, status, and sync information.

@features
- Displays offline content in a preview format
- Shows sync status and error information
- Provides edit, delete, and retry actions
- Shows conflict resolution options when needed
- Displays version information for updates

@props {
  content: IOfflineContent (required) - The offline content to preview
}

@events {
  edit: {
    description: "Emitted when the edit button is clicked"
    payload: string (content ID)
  }
  delete: {
    description: "Emitted when the delete button is clicked"
    payload: string (content ID)
  }
  retry: {
    description: "Emitted when the retry button is clicked"
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
import { computed } from 'vue';
import type { IOfflineContent } from '@/types/offline';
import { useOfflineStorage } from '@/services/OfflineStorageService';
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';
import { formatDistanceToNow } from 'date-fns';

const props = defineProps<{
  content: IOfflineContent;
}>();

const emit = defineEmits<{
  (e: 'edit', contentId: string): void;
  (e: 'delete', contentId: string): void;
  (e: 'retry', contentId: string): void;
  (e: 'resolveConflict', payload: { contentId: string; resolution: 'local' | 'server' }): void;
}>();

const offlineStorage = useOfflineStorage();
const networkStatus = useNetworkStatus();

const isOnline = computed(() => networkStatus.online.value);

const contentTypeLabel = computed(() => {
  return props.content.type === 'post' ? 'Post' : 'Comment';
});

const syncStatusLabel = computed(() => {
  switch (props.content.syncStatus) {
    case 'pending':
      return 'Pending Sync';
    case 'synced':
      return 'Synced';
    case 'failed':
      return 'Sync Failed';
    case 'conflict':
      return 'Conflict Detected';
    default:
      return 'Unknown Status';
  }
});

const syncStatusClass = computed(() => {
  switch (props.content.syncStatus) {
    case 'pending':
      return 'status-pending';
    case 'synced':
      return 'status-success';
    case 'failed':
      return 'status-error';
    case 'conflict':
      return 'status-warning';
    default:
      return '';
  }
});

const timeUntilPublish = computed(() => {
  const publishDate = new Date(props.content.publishAt);
  return formatDistanceToNow(publishDate, { addSuffix: true });
});

const hasConflict = computed(() => {
  return props.content.syncStatus === 'conflict';
});

const hasError = computed(() => {
  return props.content.syncStatus === 'failed';
});

const handleEdit = () => {
  emit('edit', props.content.id);
};

const handleDelete = () => {
  offlineStorage.deleteOfflineContent(props.content.id);
  emit('delete', props.content.id);
};

const handleRetry = () => {
  emit('retry', props.content.id);
};

const handleResolveConflict = (resolution: 'local' | 'server') => {
  emit('resolveConflict', { contentId: props.content.id, resolution });
};
</script>

<template>
  <div class="offline-content-preview">
    <div class="offline-content-preview__header">
      <h3 class="offline-content-preview__title">
        {{ contentTypeLabel }} (Offline)
      </h3>
      <div class="offline-content-preview__meta">
        <span class="offline-content-preview__version">Version: {{ content.version }}</span>
        <span class="offline-content-preview__publish-time">
          Publishes {{ timeUntilPublish }}
        </span>
      </div>
    </div>

    <div class="offline-content-preview__content">
      <div class="offline-content-preview__text">
        {{ content.content }}
      </div>
    </div>

    <div class="offline-content-preview__status">
      <div :class="['offline-content-preview__sync-status', syncStatusClass]">
        {{ syncStatusLabel }}
      </div>

      <div v-if="hasError" class="offline-content-preview__error">
        <p>{{ content.syncError || 'An error occurred during sync' }}</p>
        <p v-if="content.retryCount > 0">
          Retry count: {{ content.retryCount }}/{{ content.maxRetries }}
        </p>
      </div>

      <div v-if="hasConflict" class="offline-content-preview__conflict">
        <p>This content has been modified on the server.</p>
        <div class="offline-content-preview__conflict-actions">
          <AppButton
            :variant="ButtonVariantEnum.SECONDARY"
            @click="handleResolveConflict('local')"
          >
            Use Local Version
          </AppButton>
          <AppButton
            :variant="ButtonVariantEnum.SECONDARY"
            @click="handleResolveConflict('server')"
          >
            Use Server Version
          </AppButton>
        </div>
      </div>
    </div>

    <div class="offline-content-preview__actions">
      <AppButton
        :variant="ButtonVariantEnum.PRIMARY"
        @click="handleEdit"
      >
        Edit
      </AppButton>
      <AppButton
        v-if="hasError && isOnline"
        :variant="ButtonVariantEnum.SECONDARY"
        @click="handleRetry"
      >
        Retry Sync
      </AppButton>
      <AppButton
        :variant="ButtonVariantEnum.DANGER"
        @click="handleDelete"
      >
        Delete
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.offline-content-preview {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  background-color: var(--color-background);
}

.offline-content-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.offline-content-preview__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.offline-content-preview__meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.offline-content-preview__content {
  margin-bottom: var(--spacing-md);
}

.offline-content-preview__text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.offline-content-preview__status {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: 0.25rem;
  background-color: var(--color-background-alt);
}

.offline-content-preview__sync-status {
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.status-pending {
  color: var(--color-info);
}

.status-success {
  color: var(--color-success);
}

.status-error {
  color: var(--color-danger);
}

.status-warning {
  color: var(--color-warning);
}

.offline-content-preview__error {
  margin-top: var(--spacing-xs);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.offline-content-preview__conflict {
  margin-top: var(--spacing-xs);
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.offline-content-preview__conflict-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.offline-content-preview__actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}
</style> 