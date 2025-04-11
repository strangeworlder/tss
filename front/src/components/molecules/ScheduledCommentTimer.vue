<!--
  ScheduledCommentTimer.vue
  A component that displays a countdown timer for scheduled comments.
  
  Features:
  - Real-time countdown display
  - Offline support with pause/resume
  - Timezone handling
  - Visual feedback for different states
  - Accessibility support
  
  Props:
  - contentId: string - The ID of the scheduled comment
  - publishAt: Date - The scheduled publication time
  - status: string - The current status of the comment
  
  Events:
  - None
  
  Accessibility:
  - Uses semantic HTML
  - Provides ARIA labels for status and time
  - Maintains proper contrast ratios
  - Supports screen readers
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useTimerService } from '@/services/TimerService';
import { useScheduledContentStore } from '@/stores/scheduledContentStore';
import type { IScheduledContent } from '@/types/scheduledContent';

const props = defineProps<{
  contentId: string;
  publishAt: Date;
  status: string;
}>();

const store = useScheduledContentStore();
const timerService = useTimerService();

const timer = ref<ReturnType<typeof timerService.createTimer>>();

const statusClass = computed(() => {
  switch (props.status) {
    case 'scheduled':
      return 'scheduled-comment-timer--scheduled';
    case 'publishing':
      return 'scheduled-comment-timer--publishing';
    case 'published':
      return 'scheduled-comment-timer--published';
    case 'failed':
      return 'scheduled-comment-timer--failed';
    default:
      return '';
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

onMounted(() => {
  timer.value = timerService.createTimer(props.contentId, props.publishAt);
});

onUnmounted(() => {
  if (timer.value) {
    timerService.removeTimer(props.contentId);
  }
});
</script>

<template>
  <div
    class="scheduled-comment-timer"
    :class="statusClass"
    role="status"
    :aria-label="'Comment publication status: ' + statusText"
  >
    <div class="scheduled-comment-timer__status">
      <span class="scheduled-comment-timer__status-text">{{ statusText }}</span>
    </div>
    <div
      v-if="timer && timer.remainingTime.value"
      class="scheduled-comment-timer__time"
      :aria-label="'Time remaining until publication: ' + timer.remainingTime.value"
    >
      <span class="scheduled-comment-timer__time-text">{{ timer.remainingTime.value }}</span>
      <span
        v-if="timer && timer.isOffline.value"
        class="scheduled-comment-timer__offline-indicator"
        aria-label="Timer paused - you are offline"
      >
        (Offline)
      </span>
    </div>
  </div>
</template>

<style>
.scheduled-comment-timer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background-alt);
  font-size: var(--font-size-sm);
}

.scheduled-comment-timer--scheduled {
  border-left: 0.25rem solid var(--color-primary);
}

.scheduled-comment-timer--publishing {
  border-left: 0.25rem solid var(--color-warning);
}

.scheduled-comment-timer--published {
  border-left: 0.25rem solid var(--color-success);
}

.scheduled-comment-timer--failed {
  border-left: 0.25rem solid var(--color-danger);
}

.scheduled-comment-timer__status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.scheduled-comment-timer__status-text {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.scheduled-comment-timer__time {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.scheduled-comment-timer__time-text {
  font-family: var(--font-family-mono);
  color: var(--color-text-secondary);
}

.scheduled-comment-timer__offline-indicator {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}
</style> 