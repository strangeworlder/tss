<!--
@component ScheduledPostTimer
@description A component that displays a countdown timer for scheduled posts with offline support and timezone handling.

@features
- Displays remaining time until publication
- Supports offline mode with sync on reconnect
- Handles timezone differences
- Shows publication status
- Provides visual feedback for different states

@props {
  contentId: {
    type: string
    required: true
    description: "The ID of the scheduled content"
  }
  publishAt: {
    type: Date
    required: true
    description: "The scheduled publication time"
  }
  status: {
    type: string
    required: true
    description: "Current status of the content (scheduled, published, cancelled, failed)"
  }
}

@accessibility
- Uses semantic HTML elements
- Provides ARIA labels for timer values
- Includes status announcements for screen readers
- Maintains proper color contrast
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { TimerService } from '@/services/TimerService';
import type { ITimer } from '@/services/TimerService';

interface Props {
  contentId: string;
  publishAt: Date;
  status: 'scheduled' | 'published' | 'cancelled' | 'failed';
}

const props = defineProps<Props>();
const timerService = TimerService.getInstance();
const timer = ref<ITimer>();
const formattedTime = ref<string>('');

const statusClass = computed(() => `timer--${props.status}`);
const statusText = computed(() => {
  switch (props.status) {
    case 'published':
      return 'Published';
    case 'cancelled':
      return 'Cancelled';
    case 'failed':
      return 'Publication Failed';
    default:
      return 'Publishing in';
  }
});

onMounted(() => {
  timer.value = timerService.createTimer(props.contentId, props.publishAt);
  updateFormattedTime();
});

onUnmounted(() => {
  if (timer.value) {
    timerService.removeTimer(props.contentId);
  }
});

function updateFormattedTime(): void {
  if (timer.value) {
    formattedTime.value = timerService.formatRemainingTime(Number(timer.value.remainingTime.value));
    requestAnimationFrame(updateFormattedTime);
  }
}
</script>

<template>
  <div 
    class="timer" 
    :class="statusClass"
    role="timer"
    :aria-label="'Publication status: ' + statusText"
  >
    <div class="timer__status" aria-live="polite">
      {{ statusText }}
    </div>
    <div 
      v-if="timer && Number(timer.remainingTime.value) > 0" 
      class="timer__time"
      :aria-label="'Time remaining: ' + formattedTime"
    >
      {{ formattedTime }}
    </div>
    <div 
      v-if="timer && timer.isOffline.value" 
      class="timer__offline-notice"
      role="alert"
    >
      Offline - Timer will sync when online
    </div>
  </div>
</template>

<style scoped>
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--spacing-xs);
  background-color: var(--color-background-alt);
  font-family: var(--font-family-base);
}

.timer__status {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.timer__time {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.timer__offline-notice {
  font-size: var(--font-size-sm);
  color: var(--color-warning);
  background-color: var(--color-warning-bg);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
}

.timer--published {
  background-color: var(--color-success-bg);
  .timer__status {
    color: var(--color-success);
  }
}

.timer--cancelled {
  background-color: var(--color-warning-bg);
  .timer__status {
    color: var(--color-warning);
  }
}

.timer--failed {
  background-color: var(--color-danger-bg);
  .timer__status {
    color: var(--color-danger);
  }
}
</style> 