<!--
NotificationList.vue
Component name: NotificationList
Description: Reusable notification list component for displaying various types of notifications
Features:
- Display notifications with different types (warning, info, success)
- Support for action buttons
- Dismissible notifications
- Accessibility compliant
Usage:
<template>
  <NotificationList
    :notifications="notifications"
    @dismiss="handleDismiss"
    @action="handleAction"
  />
</template>
Props:
- notifications: INotification[] - List of notifications to display
Events:
- dismiss: Emitted when a notification is dismissed
- action: Emitted when a notification action is clicked
Accessibility:
- Proper ARIA labels
- Screen reader support
- Keyboard navigation
-->

<template>
  <div class="notification-list">
    <div class="notification-list__header">
      <h2 class="notification-list__title">{{ title || 'Notifications' }}</h2>
      <button
        v-if="showClearAll && notifications.length > 0"
        class="notification-list__clear-all"
        @click="clearAllNotifications"
        aria-label="Clear all notifications"
      >
        Clear All
      </button>
    </div>

    <div class="notification-list__list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-list__item"
        :class="{
          'notification-list__item--warning': notification.type === 'warning',
          'notification-list__item--info': notification.type === 'info',
          'notification-list__item--success': notification.type === 'success'
        }"
        role="alert"
        :aria-live="notification.type === 'warning' ? 'assertive' : 'polite'"
      >
        <div class="notification-list__item-content">
          <div class="notification-list__item-icon">
            <span v-if="notification.type === 'warning'" aria-hidden="true">⚠️</span>
            <span v-else-if="notification.type === 'info'" aria-hidden="true">ℹ️</span>
            <span v-else aria-hidden="true">✅</span>
          </div>
          <div class="notification-list__item-text">
            <div class="notification-list__item-title">
              {{ notification.title }}
            </div>
            <div class="notification-list__item-message">
              {{ notification.message }}
            </div>
            <div class="notification-list__item-time">
              {{ formatTime(notification.timestamp) }}
            </div>
          </div>
        </div>
        <div class="notification-list__item-actions">
          <button
            v-if="notification.action"
            class="notification-list__item-action"
            @click="handleAction(notification)"
            :aria-label="notification.actionLabel || 'Take action'"
          >
            {{ notification.actionLabel || 'Action' }}
          </button>
          <button
            class="notification-list__item-dismiss"
            @click="handleDismiss(notification.id)"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="notifications.length === 0"
      class="notification-list__empty"
      role="status"
    >
      {{ emptyMessage || 'No notifications to display' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '@/utils/date';

interface INotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  action?: () => void;
  actionLabel?: string;
}

// Props
const props = defineProps<{
  notifications: INotification[];
  title?: string;
  emptyMessage?: string;
  showClearAll?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'dismiss', id: string): void;
  (e: 'action', notification: INotification): void;
}>();

// Methods
const formatTime = (timestamp: Date) => {
  return formatRelativeTime(timestamp);
};

const handleDismiss = (id: string) => {
  emit('dismiss', id);
};

const handleAction = (notification: INotification) => {
  emit('action', notification);
};

const clearAllNotifications = () => {
  for (const notification of props.notifications) {
    emit('dismiss', notification.id);
  }
};
</script>

<style scoped>
.notification-list {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.notification-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.notification-list__title {
  margin: 0;
  font-size: var(--font-size-lg);
}

.notification-list__clear-all {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.notification-list__clear-all:hover {
  background-color: var(--color-background-alt);
}

.notification-list__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.notification-list__item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
}

.notification-list__item--warning {
  border-left: 4px solid var(--color-warning);
}

.notification-list__item--info {
  border-left: 4px solid var(--color-info);
}

.notification-list__item--success {
  border-left: 4px solid var(--color-success);
}

.notification-list__item-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  flex: 1;
}

.notification-list__item-icon {
  font-size: var(--font-size-lg);
}

.notification-list__item-text {
  flex: 1;
}

.notification-list__item-title {
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.notification-list__item-message {
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.notification-list__item-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.notification-list__item-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.notification-list__item-action {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  cursor: pointer;
}

.notification-list__item-dismiss {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
}

.notification-list__empty {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--color-text-muted);
  font-style: italic;
}
</style> 