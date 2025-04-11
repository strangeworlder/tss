<!--
  NotificationPreferences.vue
  A component for managing notification preferences.
  Features:
  - Toggle email, push, and in-app notifications
  - Configure notification types
  - Save preferences to localStorage
  - Responsive design
  - Accessible form controls
-->
<template>
  <div class="notification-preferences">
    <h2 class="notification-preferences__title">Notification Preferences</h2>
    
    <form class="notification-preferences__form" @submit.prevent="savePreferences">
      <div class="notification-preferences__section">
        <h3 class="notification-preferences__section-title">Notification Channels</h3>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.email"
              class="notification-preferences__checkbox"
            />
            Email Notifications
          </label>
          <p class="notification-preferences__description">
            Receive notifications via email
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.push"
              class="notification-preferences__checkbox"
            />
            Push Notifications
          </label>
          <p class="notification-preferences__description">
            Receive browser push notifications
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.inApp"
              class="notification-preferences__checkbox"
            />
            In-App Notifications
          </label>
          <p class="notification-preferences__description">
            Show notifications within the application
          </p>
        </div>
      </div>
      
      <div class="notification-preferences__section">
        <h3 class="notification-preferences__section-title">Notification Types</h3>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_scheduled"
              class="notification-preferences__checkbox"
            />
            Content Scheduled
          </label>
          <p class="notification-preferences__description">
            Get notified when your content is scheduled for publication
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_published"
              class="notification-preferences__checkbox"
            />
            Content Published
          </label>
          <p class="notification-preferences__description">
            Get notified when your content is published
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_publication_failed"
              class="notification-preferences__checkbox"
            />
            Publication Failed
          </label>
          <p class="notification-preferences__description">
            Get notified when content publication fails
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_publishing_soon"
              class="notification-preferences__checkbox"
            />
            Content Publishing Soon
          </label>
          <p class="notification-preferences__description">
            Get notified when content is scheduled to be published soon
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_update_scheduled"
              class="notification-preferences__checkbox"
            />
            Content Update Scheduled
          </label>
          <p class="notification-preferences__description">
            Get notified when content is scheduled for an update
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_update_published"
              class="notification-preferences__checkbox"
            />
            Content Update Published
          </label>
          <p class="notification-preferences__description">
            Get notified when content is published after an update
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_update_publication_failed"
              class="notification-preferences__checkbox"
            />
            Content Update Publication Failed
          </label>
          <p class="notification-preferences__description">
            Get notified when content update publication fails
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_update_publishing_soon"
              class="notification-preferences__checkbox"
            />
            Content Update Publishing Soon
          </label>
          <p class="notification-preferences__description">
            Get notified when content update is scheduled to be published soon
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_cancelled"
              class="notification-preferences__checkbox"
            />
            Content Cancelled
          </label>
          <p class="notification-preferences__description">
            Get notified when content is cancelled
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.content_rescheduled"
              class="notification-preferences__checkbox"
            />
            Content Rescheduled
          </label>
          <p class="notification-preferences__description">
            Get notified when content is rescheduled
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.system_error"
              class="notification-preferences__checkbox"
            />
            System Error
          </label>
          <p class="notification-preferences__description">
            Get notified when a system error occurs
          </p>
        </div>
        
        <div class="notification-preferences__option">
          <label class="notification-preferences__label">
            <input
              type="checkbox"
              v-model="preferences.types.offline_sync"
              class="notification-preferences__checkbox"
            />
            Offline Sync
          </label>
          <p class="notification-preferences__description">
            Get notified when offline content is synced
          </p>
        </div>
      </div>
      
      <div class="notification-preferences__actions">
        <button
          type="submit"
          class="notification-preferences__button notification-preferences__button--primary"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Saving...' : 'Save Preferences' }}
        </button>
        
        <button
          type="button"
          class="notification-preferences__button notification-preferences__button--secondary"
          @click="resetPreferences"
          :disabled="isSaving"
        >
          Reset to Defaults
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { INotificationPreferences } from '@/services/NotificationService';
import { useNotificationService } from '@/services/NotificationService';

const notificationService = useNotificationService();
const preferences = ref<INotificationPreferences>({
  email: true,
  push: true,
  inApp: true,
  types: {
    content_scheduled: true,
    content_published: true,
    content_publication_failed: true,
    content_publishing_soon: true,
    content_update_scheduled: true,
    content_update_published: true,
    content_update_publication_failed: true,
    content_update_publishing_soon: true,
    content_cancelled: true,
    content_rescheduled: true,
    system_error: true,
    offline_sync: true,
  },
});

const isSaving = ref(false);

onMounted(async () => {
  preferences.value = await notificationService.getPreferences();
});

const savePreferences = async () => {
  isSaving.value = true;
  try {
    await notificationService.updatePreferences(preferences.value);
  } finally {
    isSaving.value = false;
  }
};

const resetPreferences = () => {
  preferences.value = {
    email: true,
    push: true,
    inApp: true,
    types: {
      content_scheduled: true,
      content_published: true,
      content_publication_failed: true,
      content_publishing_soon: true,
      content_update_scheduled: true,
      content_update_published: true,
      content_update_publication_failed: true,
      content_update_publishing_soon: true,
      content_cancelled: true,
      content_rescheduled: true,
      system_error: true,
      offline_sync: true,
    },
  };
};
</script>

<style scoped>
.notification-preferences {
  max-width: 40rem;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.notification-preferences__title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.notification-preferences__section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: 0.5rem;
}

.notification-preferences__section-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.notification-preferences__option {
  margin-bottom: var(--spacing-md);
}

.notification-preferences__label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  cursor: pointer;
}

.notification-preferences__checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.notification-preferences__description {
  margin-top: var(--spacing-xs);
  margin-left: 1.75rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.notification-preferences__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.notification-preferences__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 0.25rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-preferences__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notification-preferences__button--primary {
  background-color: var(--color-primary-600);
  color: white;
  border: none;
}

.notification-preferences__button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.notification-preferences__button--secondary {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.notification-preferences__button--secondary:hover:not(:disabled) {
  background-color: var(--color-background-alt);
}
</style> 