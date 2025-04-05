<template>
  <div class="notification-list">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-list__item"
        :class="`notification-list__item--${notification.type}`"
      >
        <div class="notification-list__content">
          {{ notification.message }}
        </div>
        <Button
          variant="text"
          class="notification-list__close"
          @click="removeNotification(notification.id)"
        >
          ×
        </Button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/stores/notification'
import Button from '@/components/atoms/Button.vue'

const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.getNotifications)

const removeNotification = (id: string) => {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.notification-list {
  position: fixed;
  top: var(--spacing-4);
  right: var(--spacing-4);
  z-index: var(--z-index-notification);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.notification-list__item {
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-primary);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  min-width: var(--notification-min-width);
  max-width: var(--notification-max-width);
}

.notification-list__item--success {
  border-left: 4px solid var(--color-success);
}

.notification-list__item--error {
  border-left: 4px solid var(--color-error);
}

.notification-list__item--info {
  border-left: 4px solid var(--color-info);
}

.notification-list__content {
  flex: 1;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.notification-list__close {
  padding: 0;
  width: var(--spacing-6);
  height: var(--spacing-6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xl);
}

.notification-enter-active,
.notification-leave-active {
  transition: all var(--transition-normal);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(var(--spacing-8));
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(var(--spacing-8));
}
</style>
