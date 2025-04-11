<!--
@component ScheduledPostStatus
@description A component that displays the current status of scheduled posts with visual indicators.

@features
- Shows current publication status
- Displays error messages if any
- Provides retry action for failed publications
- Shows offline state
- Indicates pending updates

@props {
  status: {
    type: string
    required: true
    description: "Current status of the content"
  }
  error: {
    type: string
    required: false
    description: "Error message if publication failed"
  }
  hasActiveUpdate: {
    type: boolean
    required: false
    default: false
    description: "Whether the content has a pending update"
  }
}

@events {
  retry: {
    description: "Emitted when retry button is clicked"
  }
}

@accessibility
- Uses semantic HTML elements
- Provides ARIA labels for status changes
- Includes error announcements
- Maintains proper color contrast
-->

<script setup lang="ts">
import { computed } from 'vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';

interface Props {
  status: 'scheduled' | 'published' | 'cancelled' | 'failed';
  error?: string;
  hasActiveUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  error: undefined,
  hasActiveUpdate: false,
});

const emit = defineEmits<(e: 'retry') => void>();

const statusClass = computed(() => `status--${props.status}`);
const statusIcon = computed(() => {
  switch (props.status) {
    case 'scheduled':
      return '⏳';
    case 'published':
      return '✅';
    case 'cancelled':
      return '❌';
    case 'failed':
      return '⚠️';
    default:
      return '❓';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'scheduled':
      return 'Scheduled for publication';
    case 'published':
      return 'Published';
    case 'cancelled':
      return 'Publication cancelled';
    case 'failed':
      return 'Publication failed';
    default:
      return 'Unknown status';
  }
});

function handleRetry(): void {
  emit('retry');
}
</script>

<template>
  <div 
    class="status" 
    :class="statusClass"
    role="status"
    :aria-label="statusText"
  >
    <div class="status__icon" aria-hidden="true">
      {{ statusIcon }}
    </div>
    <div class="status__content">
      <div class="status__text">
        {{ statusText }}
        <span 
          v-if="hasActiveUpdate" 
          class="status__update-badge"
          role="status"
          aria-label="Has pending update"
        >
          Update Pending
        </span>
      </div>
      <div 
        v-if="error" 
        class="status__error"
        role="alert"
      >
        {{ error }}
      </div>
      <AppButton
        v-if="status === 'failed'"
        :variant="ButtonVariantEnum.PRIMARY"
        @click="handleRetry"
        class="status__retry"
        aria-label="Retry publication"
      >
        Retry Publication
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.status {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--spacing-xs);
  background-color: var(--color-background-alt);
}

.status__icon {
  font-size: var(--font-size-lg);
  line-height: 1;
}

.status__content {
  flex: 1;
}

.status__text {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.status__update-badge {
  font-size: var(--font-size-sm);
  background-color: var(--color-info-bg);
  color: var(--color-info);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
}

.status__error {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  background-color: var(--color-danger-bg);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
}

.status__retry {
  margin-top: var(--spacing-sm);
}

.status--scheduled {
  border-left: 4px solid var(--color-info);
}

.status--published {
  border-left: 4px solid var(--color-success);
}

.status--cancelled {
  border-left: 4px solid var(--color-warning);
}

.status--failed {
  border-left: 4px solid var(--color-danger);
}
</style> 