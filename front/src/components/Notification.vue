<!--
  Notification Component
  Features:
  - Displays a single notification with appropriate styling based on type
  - Supports all notification types from NotificationTypeEnum
  - Handles read/unread states
  - Provides dismiss functionality
  - Accessible with proper ARIA attributes
  - Responsive design
  - Uses semantic variables for styling
-->
<template>
  <div
    :class="[
      'notification',
      `notification--${notification.type}`,
      { 'notification--read': notification.read }
    ]"
    role="alert"
    :aria-live="notification.read ? 'off' : 'assertive'"
  >
    <div class="notification__content">
      <h3 class="notification__title">{{ notification.title }}</h3>
      <p class="notification__message">{{ notification.message }}</p>
      <div v-if="getMetadataValue(notification, 'publishAt')" class="notification__metadata">
        <span class="notification__metadata-label">Scheduled for:</span>
        <span class="notification__metadata-value">
          {{ formatDate(getMetadataValue(notification, 'publishAt')) }}
        </span>
      </div>
    </div>
    <button
      class="notification__dismiss"
      @click="dismiss"
      aria-label="Dismiss notification"
    >
      <span class="notification__dismiss-icon">&times;</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { INotification } from '@/services/NotificationService';
import { NotificationTypeEnum } from '@/services/NotificationService';
import { useNotificationService } from '@/services/NotificationService';

const props = defineProps<{
  notification: INotification;
}>();

const emit = defineEmits<(e: 'dismiss', id: string) => void>();

const notificationService = useNotificationService();

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
};

// Helper function to safely access metadata
const getMetadataValue = (notification: INotification, key: string): string | undefined => {
  if (!notification.metadata || typeof notification.metadata !== 'object') return undefined;
  const value = notification.metadata[key];
  return typeof value === 'string' ? value : undefined;
};

const markAsRead = async (): Promise<void> => {
  await notificationService.markAsRead(props.notification.id);
};

const dismiss = (): void => {
  emit('dismiss', props.notification.id);
};
</script>

<style>
.notification {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-radius: 0.25rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease-in-out;
}

.notification--unread {
  background-color: var(--color-background-alt);
  border-left: 4px solid var(--color-primary-500);
}

.notification__content {
  flex: 1;
  margin-right: var(--spacing-md);
}

.notification__title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.notification__message {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.notification__metadata {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.notification__error {
  color: var(--color-danger);
}

.notification__time {
  color: var(--color-text-muted);
}

.notification__actions {
  display: flex;
  gap: var(--spacing-xs);
}

.notification__button {
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s ease-in-out;
}

.notification__button:hover {
  color: var(--color-text);
}

.notification__icon {
  font-size: var(--font-size-md);
  line-height: 1;
}

/* Notification type-specific styles */
.notification--content_scheduled {
  border-left-color: var(--color-info);
}

.notification--content_published {
  border-left-color: var(--color-success);
}

.notification--content_publication_failed {
  border-left-color: var(--color-danger);
}

.notification--content_publishing_soon {
  border-left-color: var(--color-warning);
}

.notification--content_update_scheduled {
  border-left-color: var(--color-info);
}

.notification--content_update_published {
  border-left-color: var(--color-success);
}

.notification--content_update_publication_failed {
  border-left-color: var(--color-danger);
}

.notification--content_update_publishing_soon {
  border-left-color: var(--color-warning);
}

.notification--content_cancelled {
  border-left-color: var(--color-neutral-500);
}

.notification--content_rescheduled {
  border-left-color: var(--color-info);
}

.notification--system_error {
  border-left-color: var(--color-danger);
}

.notification--offline_sync {
  border-left-color: var(--color-warning);
}
</style> 