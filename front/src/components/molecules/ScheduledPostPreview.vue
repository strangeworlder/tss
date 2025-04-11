<!--
@component ScheduledPostPreview
@description A preview component for scheduled posts that shows content and status.

@features
- Displays post content in a preview format
- Shows scheduling status and timer
- Provides edit and cancel actions
- Supports offline state
- Shows version information for updates

@props {
  contentId: string (required) - The ID of the content being scheduled
  publishAt: string (required) - The scheduled publication date/time
  content: string (required) - The content preview text
  version: number (required) - The content version
  hasActiveUpdate?: boolean (optional) - Whether there is a pending update
}

@events {
  edit: {
    description: "Emitted when the edit button is clicked"
    payload: string (content ID)
  }
  cancel: {
    description: "Emitted when the cancel button is clicked"
    payload: string (content ID)
  }
  retry: {
    description: "Emitted when the retry button is clicked"
    payload: string (content ID)
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
import { onMounted, computed } from 'vue';
import { useScheduledContentStore } from '@/stores/scheduledContent';
import type { IScheduledContent } from '@/types/scheduling';
import ScheduledPostTimer from '@/components/molecules/ScheduledPostTimer.vue';
import ScheduledPostStatus from '@/components/molecules/ScheduledPostStatus.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';

interface Props {
  contentId: string;
  publishAt: string;
  content: string;
  version: number;
  hasActiveUpdate?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'edit', contentId: string): void;
  (e: 'cancel', contentId: string): void;
  (e: 'retry', contentId: string): void;
}>();

const store = useScheduledContentStore();

const scheduledContent = computed(() => store.getScheduledContentById(props.contentId));
const isEditable = computed(() => !store.loading && !props.hasActiveUpdate);
const publishDate = computed(() => new Date(props.publishAt));

onMounted(async () => {
  await store.fetchScheduledContent(props.contentId);
});

const handleEdit = (): void => {
  if (isEditable.value) {
    emit('edit', props.contentId);
  }
};

const handleCancel = async (): Promise<void> => {
  if (isEditable.value) {
    await store.cancelScheduledContent(props.contentId);
    emit('cancel', props.contentId);
  }
};

const handleRetry = async (): Promise<void> => {
  if (isEditable.value) {
    await store.retryPublication(props.contentId);
    emit('retry', props.contentId);
  }
};
</script>

<template>
  <article class="scheduled-post-preview">
    <header class="scheduled-post-preview__header">
      <h2 class="scheduled-post-preview__title">Scheduled Post</h2>
      <div class="scheduled-post-preview__actions">
        <button
          type="button"
          class="scheduled-post-preview__edit-button"
          :disabled="!isEditable"
          @click="handleEdit"
          aria-label="Edit scheduled post"
        >
          Edit
        </button>
        <button
          type="button"
          class="scheduled-post-preview__cancel-button"
          :disabled="!isEditable"
          @click="handleCancel"
          aria-label="Cancel scheduled post"
        >
          Cancel
        </button>
      </div>
    </header>

    <div class="scheduled-post-preview__timer">
      <ScheduledPostTimer
        :content-id="contentId"
        :publish-at="publishDate"
        :status="scheduledContent?.status"
      />
    </div>

    <div class="scheduled-post-preview__content">
      <p>{{ content }}</p>
    </div>

    <footer class="scheduled-post-preview__footer">
      <div class="scheduled-post-preview__version">
        Version: {{ version }}
        <span v-if="hasActiveUpdate" class="scheduled-post-preview__update-badge">
          Update pending
        </span>
      </div>

      <ScheduledPostStatus
        :status="scheduledContent?.status"
        :error="scheduledContent?.error"
        :has-active-update="hasActiveUpdate"
        @retry="handleRetry"
      />
    </footer>
  </article>
</template>

<style scoped>
.scheduled-post-preview {
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-md);
  background-color: var(--color-background);
}

.scheduled-post-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.scheduled-post-preview__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.scheduled-post-preview__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.scheduled-post-preview__edit-button,
.scheduled-post-preview__cancel-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.scheduled-post-preview__edit-button:disabled,
.scheduled-post-preview__cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scheduled-post-preview__timer {
  margin-bottom: var(--spacing-md);
}

.scheduled-post-preview__content {
  font-family: var(--font-family-base);
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: var(--spacing-xs);
  white-space: pre-wrap;
}

.scheduled-post-preview__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.scheduled-post-preview__version {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.scheduled-post-preview__update-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-info);
  color: var(--color-text);
  border-radius: var(--spacing-xs);
  font-size: var(--font-size-xs);
}
</style> 