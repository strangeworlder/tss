<!--
  NotificationBadge.vue
  A component that displays the number of unread notifications and provides a way to access the notification list.
  
  Features:
  - Shows unread notification count
  - Provides a button to open the notification list
  - Animates when new notifications arrive
  - Shows a dot indicator when there are unread notifications
  - Accessible with keyboard navigation and screen readers
  
  Props:
  - count: number - The number of unread notifications
  - onClick: () => void - Callback function when the badge is clicked
  
  Events:
  - click: Emitted when the badge is clicked
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps<{
  count?: number;
}>();

const emit = defineEmits<(e: 'click') => void>();

const notificationStore = useNotificationStore();

const unreadCount = computed(() => props.count ?? notificationStore.unreadCount);
const hasUnread = computed(() => unreadCount.value > 0);

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <button
    class="notification-badge"
    :class="{ 'notification-badge--has-unread': hasUnread }"
    @click="handleClick"
    aria-label="Notifications"
  >
    <span class="notification-badge__icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </span>
    <span
      v-if="hasUnread"
      class="notification-badge__count"
      aria-label="Unread notifications"
    >
      {{ unreadCount }}
    </span>
    <span
      v-if="hasUnread"
      class="notification-badge__dot"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
.notification-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text);
  transition: color 0.2s ease-in-out;
}

.notification-badge:hover {
  color: var(--color-primary-500);
}

.notification-badge__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-badge__count {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  border-radius: 0.625rem;
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.notification-badge__dot {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: var(--color-primary-500);
}

.notification-badge--has-unread .notification-badge__icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style> 