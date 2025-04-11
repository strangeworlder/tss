<!--
  ScheduledCommentPreview.vue
  A component that displays a preview of scheduled comments.
  
  Features:
  - Comment content preview
  - Publication timer
  - Status display
  - Edit and cancel actions
  - Version tracking
  - Accessibility support
  
  Props:
  - contentId: string - The ID of the scheduled comment
  - publishAt: string - The scheduled publication time
  - content: string - The comment content
  - version: number - The version number of the comment
  - hasActiveUpdate?: boolean - Whether there is an active update
  
  Events:
  - edit - Emitted when the edit button is clicked
  - cancel - Emitted when the cancel button is clicked
  - retry - Emitted when the retry button is clicked
  
  Accessibility:
  - Uses semantic HTML
  - Provides ARIA labels for actions
  - Maintains proper contrast ratios
  - Supports screen readers
-->

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useScheduledContentStore } from '@/stores/scheduledContentStore';
import ScheduledCommentTimer from '@/components/molecules/ScheduledCommentTimer.vue';
import ScheduledCommentStatus from '@/components/molecules/ScheduledCommentStatus.vue';

const props = defineProps<{
  contentId: string;
  publishAt: string;
  content: string;
  version: number;
  hasActiveUpdate?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', contentId: string): void;
  (e: 'cancel', contentId: string): void;
  (e: 'retry', contentId: string): void;
}>();

const store = useScheduledContentStore();

const scheduledContent = computed(() => store.getContentById(props.contentId));
const isEditable = computed(() => !store.loading && !props.hasActiveUpdate);

const publishDate = computed(() => new Date(props.publishAt));

onMounted(async () => {
  if (!scheduledContent.value) {
    await store.fetchScheduledContent(props.contentId);
  }
});

const handleEdit = () => {
  emit('edit', props.contentId);
};

const handleCancel = () => {
  emit('cancel', props.contentId);
};

const handleRetry = () => {
  emit('retry', props.contentId);
};
</script>

<template>
  <div class="scheduled-comment-preview">
    <div class="scheduled-comment-preview__header">
      <ScheduledCommentTimer
        :content-id="contentId"
        :publish-at="publishDate"
        :status="scheduledContent?.status"
      />
      <div class="scheduled-comment-preview__actions">
        <button
          v-if="isEditable"
          class="scheduled-comment-preview__action-button"
          @click="handleEdit"
          aria-label="Edit scheduled comment"
        >
          Edit
        </button>
        <button
          v-if="isEditable"
          class="scheduled-comment-preview__action-button scheduled-comment-preview__action-button--danger"
          @click="handleCancel"
          aria-label="Cancel scheduled comment"
        >
          Cancel
        </button>
      </div>
    </div>
    <div class="scheduled-comment-preview__content">
      {{ content }}
    </div>
    <div class="scheduled-comment-preview__footer">
      <div class="scheduled-comment-preview__version">
        Version {{ version }}
      </div>
      <ScheduledCommentStatus
        :status="scheduledContent?.status"
        :error="scheduledContent?.error"
        :has-active-update="hasActiveUpdate"
        @retry="handleRetry"
      />
    </div>
  </div>
</template>

<style>
.scheduled-comment-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
}

.scheduled-comment-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.scheduled-comment-preview__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.scheduled-comment-preview__action-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-background-alt);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scheduled-comment-preview__action-button:hover {
  background-color: var(--color-background-muted);
  border-color: var(--color-border-hover);
}

.scheduled-comment-preview__action-button--danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.scheduled-comment-preview__action-button--danger:hover {
  background-color: var(--color-danger);
  color: var(--color-background);
}

.scheduled-comment-preview__content {
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre-wrap;
}

.scheduled-comment-preview__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.scheduled-comment-preview__version {
  font-family: var(--font-family-mono);
}
</style> 