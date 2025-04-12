<!--
AuthorNotifications.vue
Component name: AuthorNotifications
Description: Author-specific notification component for content scheduling and publishing
Features:
- Extends generic NotificationList component
- Author-specific notification filtering
- Content publishing notifications
- Scheduling conflict warnings
- Accessibility compliant
Usage:
<template>
  <AuthorNotifications :notifications="authorNotifications" />
</template>
Props:
- notifications: INotification[] - List of notifications to display
Events:
- dismiss: Emitted when a notification is dismissed
- action: Emitted when a notification action is clicked
Accessibility:
- Inherits accessibility features from NotificationList
-->

<template>
  <div class="author-notifications">
    <NotificationList
      :notifications="filteredNotifications"
      title="Author Notifications"
      emptyMessage="No author notifications to display"
      :showClearAll="true"
      @dismiss="onDismiss"
      @action="onAction"
    />
    
    <div v-if="showFilters" class="author-notifications__filters">
      <h3 class="author-notifications__filters-title">Filter Notifications</h3>
      <div class="author-notifications__filter-options">
        <label class="author-notifications__filter-option">
          <input
            type="checkbox"
            v-model="filters.showScheduling"
            class="author-notifications__filter-checkbox"
          />
          Scheduling Notifications
        </label>
        
        <label class="author-notifications__filter-option">
          <input
            type="checkbox"
            v-model="filters.showPublishing"
            class="author-notifications__filter-checkbox"
          />
          Publishing Notifications
        </label>
        
        <label class="author-notifications__filter-option">
          <input
            type="checkbox"
            v-model="filters.showConflicts"
            class="author-notifications__filter-checkbox"
          />
          Conflict Warnings
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NotificationList from '@/components/molecules/notifications/NotificationList.vue';

interface INotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  category?: string;
  action?: () => void;
  actionLabel?: string;
}

// Props
const props = defineProps<{
  notifications: INotification[];
  showFilters?: boolean;
}>();

// Emit
const emit = defineEmits<{
  (e: 'dismiss', id: string): void;
  (e: 'action', notification: INotification): void;
}>();

// Author-specific filters
const filters = ref({
  showScheduling: true,
  showPublishing: true,
  showConflicts: true,
});

// Computed
const filteredNotifications = computed(() => {
  return props.notifications.filter((notification) => {
    // Check category-based filtering
    if (notification.category === 'scheduling' && !filters.value.showScheduling) {
      return false;
    }
    if (notification.category === 'publishing' && !filters.value.showPublishing) {
      return false;
    }
    // All warnings are considered conflicts
    if (notification.type === 'warning' && !filters.value.showConflicts) {
      return false;
    }
    return true;
  });
});

// Event handlers
const onDismiss = (id: string) => {
  emit('dismiss', id);
};

const onAction = (notification: INotification) => {
  emit('action', notification);
};
</script>

<style scoped>
.author-notifications {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.author-notifications__filters {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background-alt);
}

.author-notifications__filters-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.author-notifications__filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.author-notifications__filter-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.author-notifications__filter-checkbox {
  width: 18px;
  height: 18px;
}
</style>
