<!--
@component NotificationList
@description A component that displays a list of notifications with different types (success, error, warning, info).

@features
- Displays notifications in a list format
- Supports different notification types (success, error, warning, info)
- Animates notifications when they appear and disappear
- Allows users to dismiss notifications
- Responsive design

@props
None - uses the notification store directly

@events
None - communicates with the notification store directly

@accessibility
- Uses semantic HTML structure
- Provides clear visual indicators for different notification types
- Ensures notifications are announced to screen readers
-->

<template>
  <div class="notification-list" aria-live="polite">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-list__item"
        :class="`notification-list__item--${notification.type}`"
        role="alert"
      >
        <div class="notification-list__content">
          {{ notification.message }}
        </div>
        <AppButton
          :variant="ButtonVariantEnum.TEXT"
          class="notification-list__close"
          @click="removeNotification(notification.id)"
          aria-label="Close notification"
        >
          ×
        </AppButton>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/stores/notification'
import AppButton from '@/components/atoms/AppButton.vue'
import { ButtonVariantEnum } from '@/types/button'

const notificationStore = useNotificationStore()
const notifications = computed<Notification[]>(() => notificationStore.notifications)

const removeNotification = (id: string): void => {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.notification-list {
  position: fixed;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: var(--z-index-modal);
  max-width: var(--notification-max-width);
  width: 100%;
}

.notification {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
}

.notification--success {
  background-color: var(--color-success);
  color: var(--color-text-on-success);
}

.notification--error {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger);
}

.notification--warning {
  background-color: var(--color-warning);
  color: var(--color-text-on-warning);
}

.notification--info {
  background-color: var(--color-info);
  color: var(--color-text-on-info);
}

.notification-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  animation: slideIn 0.3s ease-out;
}

.notification-list__content {
  flex: 1;
  margin-right: var(--spacing-sm);
}

.notification-list__close {
  background: transparent;
  border: none;
  color: inherit;
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(2rem);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .notification-list {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    left: var(--spacing-sm);
  }
}
</style>
