<!--
  ScheduledCommentStatus.vue
  A component that displays the current status of scheduled comments.
  
  Features:
  - Status indicator with icon
  - Error message display
  - Retry action for failed comments
  - Visual feedback for different states
  - Accessibility support
  
  Props:
  - status: string - The current status of the comment
  - error?: string - The error message if the comment failed
  - hasActiveUpdate?: boolean - Whether there is an active update
  
  Events:
  - retry - Emitted when the retry button is clicked
  
  Accessibility:
  - Uses semantic HTML
  - Provides ARIA labels for status and actions
  - Maintains proper contrast ratios
  - Supports screen readers
-->

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: string;
  error?: string;
  hasActiveUpdate?: boolean;
}>();

const emit = defineEmits<(e: 'retry') => void>();

const statusClass = computed(() => {
  switch (props.status) {
    case 'scheduled':
      return 'scheduled-comment-status--scheduled';
    case 'publishing':
      return 'scheduled-comment-status--publishing';
    case 'published':
      return 'scheduled-comment-status--published';
    case 'failed':
      return 'scheduled-comment-status--failed';
    default:
      return '';
  }
});

const statusIcon = computed(() => {
  switch (props.status) {
    case 'scheduled':
      return '⏰';
    case 'publishing':
      return '🔄';
    case 'published':
      return '✅';
    case 'failed':
      return '❌';
    default:
      return '❓';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'scheduled':
      return 'Scheduled';
    case 'publishing':
      return 'Publishing';
    case 'published':
      return 'Published';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
});

const handleRetry = () => {
  emit('retry');
};
</script>

<template>
  <div
    class="scheduled-comment-status"
    :class="statusClass"
    role="status"
    :aria-label="'Comment status: ' + statusText"
  >
    <div class="scheduled-comment-status__icon" :aria-hidden="true">
      {{ statusIcon }}
    </div>
    <div class="scheduled-comment-status__text">{{ statusText }}</div>
    <div
      v-if="error"
      class="scheduled-comment-status__error"
      role="alert"
    >
      {{ error }}
    </div>
    <button
      v-if="status === 'failed'"
      class="scheduled-comment-status__retry-button"
      @click="handleRetry"
      aria-label="Retry publishing comment"
    >
      Retry
    </button>
  </div>
</template>

<style>
.scheduled-comment-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.scheduled-comment-status--scheduled {
  color: var(--color-primary);
}

.scheduled-comment-status--publishing {
  color: var(--color-warning);
}

.scheduled-comment-status--published {
  color: var(--color-success);
}

.scheduled-comment-status--failed {
  color: var(--color-danger);
}

.scheduled-comment-status__icon {
  font-size: var(--font-size-md);
}

.scheduled-comment-status__text {
  font-weight: var(--font-weight-medium);
}

.scheduled-comment-status__error {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

.scheduled-comment-status__retry-button {
  margin-left: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-danger);
  background-color: transparent;
  color: var(--color-danger);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scheduled-comment-status__retry-button:hover {
  background-color: var(--color-danger);
  color: var(--color-background);
}
</style> 