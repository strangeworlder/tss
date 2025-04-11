<!--
  NotificationList.vue
  Displays a list of notifications with support for different types and states.
  Features:
  - Displays notifications in a list format
  - Supports different notification types with appropriate styling
  - Shows notification status (read/unread)
  - Handles notification actions (mark as read, delete)
  - Supports offline notifications
  - Accessible with keyboard navigation
  - Responsive design
-->

<template>
  <div class="notification-list" role="list">
    <div v-if="notifications.length === 0" class="notification-list__empty">
      No notifications
    </div>
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-list__item"
      :class="{
        'notification-list__item--unread': !notification.read,
        'notification-list__item--offline': isOffline(notification),
      }"
      role="listitem"
    >
      <div class="notification-list__content">
        <h3 class="notification-list__title">{{ notification.title }}</h3>
        <p class="notification-list__message">{{ notification.message }}</p>
        <div class="notification-list__meta">
          <time :datetime="notification.createdAt.toISOString()">
            {{ formatDate(notification.createdAt) }}
          </time>
          <span v-if="isOffline(notification)" class="notification-list__offline-badge">
            Offline
          </span>
        </div>
      </div>
      <div class="notification-list__actions">
        <button
          v-if="!notification.read"
          class="notification-list__action"
          @click="markAsRead(notification.id)"
          title="Mark as read"
        >
          Mark as read
        </button>
        <button
          class="notification-list__action"
          @click="deleteNotification(notification.id)"
          title="Delete notification"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOfflineStorage } from '@/services/OfflineStorageService';
import type { INotification } from '@/services/NotificationService';

const props = defineProps<{
  notifications: INotification[];
}>();

const emit = defineEmits<{
  (e: 'markAsRead', id: string): void;
  (e: 'delete', id: string): void;
}>();

const offlineStorage = useOfflineStorage();

const isOffline = (notification: INotification): boolean => {
  return offlineStorage.isContentAvailableOffline(notification.contentId ?? '');
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const markAsRead = (id: string): void => {
  emit('markAsRead', id);
};

const deleteNotification = (id: string): void => {
  emit('delete', id);
};
</script>

<style>
.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.notification-list__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-xl);
}

.notification-list__item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.notification-list__item--unread {
  background-color: var(--color-background-alt);
  border-color: var(--color-border-hover);
}

.notification-list__item--offline {
  border-style: dashed;
}

.notification-list__content {
  flex: 1;
}

.notification-list__title {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text);
}

.notification-list__message {
  margin: var(--spacing-xs) 0;
  color: var(--color-text-secondary);
}

.notification-list__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.notification-list__offline-badge {
  padding: 0.25rem 0.5rem;
  background-color: var(--color-warning);
  color: var(--color-text);
  border-radius: 0.25rem;
  font-size: var(--font-size-xs);
}

.notification-list__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.notification-list__action {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-list__action:hover {
  background-color: var(--color-background-alt);
  border-color: var(--color-border-hover);
}

.notification-list__action:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
</style> 