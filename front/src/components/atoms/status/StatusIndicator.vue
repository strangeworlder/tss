<!--
StatusIndicator.vue
Component name: StatusIndicator
Description: Reusable status indicator component
Features:
- Visual status indicators
- Customizable status types
- Accessibility compliant
Usage:
<template>
  <StatusIndicator :status="status" />
</template>
Props:
- status: string - The current status
- history?: IStatusHistory[] - Optional status history
Accessibility:
- Proper ARIA labels
- Status announcements
- Screen reader support
-->

<template>
  <div class="status-indicator">
    <div
      class="status-indicator__badge"
      :class="statusClass"
      :aria-label="statusLabel"
      role="status"
    >
      <span v-if="showIcon" class="status-indicator__icon">{{ statusIcon }}</span>
      <span class="status-indicator__text">{{ statusText }}</span>
    </div>

    <div v-if="showHistory && statusHistory.length > 0" class="status-indicator__history">
      <h3 v-if="historyTitle" class="status-indicator__history-title">{{ historyTitle }}</h3>
      <ul class="status-indicator__history-list">
        <li
          v-for="entry in statusHistory"
          :key="entry.id"
          class="status-indicator__history-item"
        >
          <div class="status-indicator__history-date">
            {{ formatDate(entry.date) }}
          </div>
          <div class="status-indicator__history-status">
            {{ entry.status }}
          </div>
          <div v-if="entry.note" class="status-indicator__history-note">
            {{ entry.note }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDateTime } from '@/utils/date';

interface IStatusHistory {
  id: string;
  date: Date;
  status: string;
  note?: string;
}

// Default status mappings
const DEFAULT_STATUS_ICONS = {
  draft: '📝',
  scheduled: '⏰',
  published: '✅',
  archived: '🗄️',
  error: '❌',
  pending: '⏳',
  active: '✓',
  inactive: '✗',
  completed: '✅',
  canceled: '❌',
};

const DEFAULT_STATUS_LABELS = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
  error: 'Error',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
  completed: 'Completed',
  canceled: 'Canceled',
};

const DEFAULT_STATUS_CLASSES = {
  draft: 'status-indicator__badge--neutral',
  scheduled: 'status-indicator__badge--info',
  published: 'status-indicator__badge--success',
  archived: 'status-indicator__badge--neutral',
  error: 'status-indicator__badge--danger',
  pending: 'status-indicator__badge--info',
  active: 'status-indicator__badge--success',
  inactive: 'status-indicator__badge--neutral',
  completed: 'status-indicator__badge--success',
  canceled: 'status-indicator__badge--danger',
};

// Props
const props = defineProps<{
  status: string;
  history?: IStatusHistory[];
  showIcon?: boolean;
  showHistory?: boolean;
  historyTitle?: string;
  icons?: Record<string, string>;
  labels?: Record<string, string>;
  statusClasses?: Record<string, string>;
}>();

// Computed
const statusIcons = computed(() => ({ ...DEFAULT_STATUS_ICONS, ...props.icons }));
const statusLabels = computed(() => ({ ...DEFAULT_STATUS_LABELS, ...props.labels }));
const statusClasses = computed(() => ({ ...DEFAULT_STATUS_CLASSES, ...props.statusClasses }));

const statusIcon = computed(() => {
  return (statusIcons.value as Record<string, string>)[props.status] || '❓';
});
const statusText = computed(() => {
  return (statusLabels.value as Record<string, string>)[props.status] || props.status || 'Unknown';
});
const statusLabel = computed(() => `Status: ${statusText.value}`);
const statusClass = computed(() => {
  return (
    (statusClasses.value as Record<string, string>)[props.status] ||
    'status-indicator__badge--default'
  );
});
const statusHistory = computed(() => props.history || []);

// Methods
const formatDate = (date: Date) => {
  return formatDateTime(date);
};
</script>

<style scoped>
.status-indicator {
  display: inline-flex;
  flex-direction: column;
}

.status-indicator__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.status-indicator__badge--default {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}

.status-indicator__badge--neutral {
  background-color: var(--color-background-muted);
  color: var(--color-text-muted);
}

.status-indicator__badge--info {
  background-color: var(--color-info);
  color: var(--color-text-inverse);
}

.status-indicator__badge--success {
  background-color: var(--color-success);
  color: var(--color-text-inverse);
}

.status-indicator__badge--warning {
  background-color: var(--color-warning);
  color: var(--color-text-inverse);
}

.status-indicator__badge--danger {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.status-indicator__icon {
  font-size: var(--font-size-sm);
}

.status-indicator__text {
  font-weight: var(--font-weight-medium);
}

.status-indicator__history {
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-md);
}

.status-indicator__history-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.status-indicator__history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-indicator__history-item {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--color-border);
}

.status-indicator__history-item:last-child {
  border-bottom: none;
}

.status-indicator__history-date {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  min-width: 100px;
}

.status-indicator__history-status {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
}

.status-indicator__history-note {
  flex: 1;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style> 