<!--
AdminSettings.vue
Component name: AdminSettings
Description: Admin settings component for managing system configuration
Features:
- Content type-specific delay settings
- System configuration management
- Validation and error handling
- Accessibility compliant
Usage:
<template>
  <AdminSettings />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper form labels
- Error messages
- Keyboard navigation
- Screen reader support
-->
<template>
  <div class="admin-settings">
    <h2 class="admin-settings__title">System Settings</h2>
    
    <form class="admin-settings__form" @submit.prevent="handleSubmit">
      <section class="admin-settings__section">
        <h3 class="admin-settings__section-title">Content Delays</h3>
        
        <div class="admin-settings__field">
          <label for="post-delay" class="admin-settings__label">
            Post Delay (minutes)
          </label>
          <input
            id="post-delay"
            v-model="settings.postDelay"
            type="number"
            min="0"
            class="admin-settings__input"
            :class="{ 'admin-settings__input--error': errors.postDelay }"
            @input="validatePostDelay"
          />
          <span v-if="errors.postDelay" class="admin-settings__error">
            {{ errors.postDelay }}
          </span>
        </div>

        <div class="admin-settings__field">
          <label for="comment-delay" class="admin-settings__label">
            Comment Delay (minutes)
          </label>
          <input
            id="comment-delay"
            v-model="settings.commentDelay"
            type="number"
            min="0"
            class="admin-settings__input"
            :class="{ 'admin-settings__input--error': errors.commentDelay }"
            @input="validateCommentDelay"
          />
          <span v-if="errors.commentDelay" class="admin-settings__error">
            {{ errors.commentDelay }}
          </span>
        </div>
      </section>

      <section class="admin-settings__section">
        <h3 class="admin-settings__section-title">System Configuration</h3>
        
        <div class="admin-settings__field">
          <label for="timezone" class="admin-settings__label">
            Default Timezone
          </label>
          <select
            id="timezone"
            v-model="settings.timezone"
            class="admin-settings__select"
            :class="{ 'admin-settings__select--error': errors.timezone }"
            @change="validateTimezone"
          >
            <option v-for="tz in timezones" :key="tz" :value="tz">
              {{ tz }}
            </option>
          </select>
          <span v-if="errors.timezone" class="admin-settings__error">
            {{ errors.timezone }}
          </span>
        </div>

        <div class="admin-settings__field">
          <label class="admin-settings__label">
            <input
              type="checkbox"
              v-model="settings.enableNotifications"
              class="admin-settings__checkbox"
            />
            Enable Notifications
          </label>
        </div>
      </section>

      <div class="admin-settings__actions">
        <button
          type="submit"
          class="admin-settings__button admin-settings__button--primary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          type="button"
          class="admin-settings__button admin-settings__button--secondary"
          @click="resetForm"
          :disabled="isSubmitting"
        >
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getAvailableTimezones } from '@/utils/timezoneUtils';

interface ISettings {
  postDelay: number;
  commentDelay: number;
  timezone: string;
  enableNotifications: boolean;
}

interface IErrors {
  postDelay?: string;
  commentDelay?: string;
  timezone?: string;
}

const authStore = useAuthStore();
const timezones = getAvailableTimezones();
const isSubmitting = ref(false);

const settings = reactive<ISettings>({
  postDelay: 0,
  commentDelay: 0,
  timezone: 'UTC',
  enableNotifications: true,
});

const errors = reactive<IErrors>({});

const validatePostDelay = () => {
  if (settings.postDelay < 0) {
    errors.postDelay = 'Post delay must be a positive number';
  } else {
    errors.postDelay = '';
  }
};

const validateCommentDelay = () => {
  if (settings.commentDelay < 0) {
    errors.commentDelay = 'Comment delay must be a positive number';
  } else {
    errors.commentDelay = '';
  }
};

const validateTimezone = () => {
  if (!timezones.includes(settings.timezone)) {
    errors.timezone = 'Invalid timezone selected';
  } else {
    errors.timezone = '';
  }
};

const resetForm = () => {
  settings.postDelay = 0;
  settings.commentDelay = 0;
  settings.timezone = 'UTC';
  settings.enableNotifications = true;

  // Reset all error messages
  errors.postDelay = '';
  errors.commentDelay = '';
  errors.timezone = '';
};

const handleSubmit = async () => {
  if (Object.keys(errors).length > 0) {
    return;
  }

  isSubmitting.value = true;
  try {
    // TODO: Implement actual settings update
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.state.token}`,
      },
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.admin-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.admin-settings__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.admin-settings__section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-md);
}

.admin-settings__section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.admin-settings__field {
  margin-bottom: var(--spacing-md);
}

.admin-settings__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.admin-settings__input,
.admin-settings__select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-md);
}

.admin-settings__input--error,
.admin-settings__select--error {
  border-color: var(--color-danger);
}

.admin-settings__error {
  display: block;
  margin-top: var(--spacing-xs);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.admin-settings__checkbox {
  margin-right: var(--spacing-xs);
}

.admin-settings__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.admin-settings__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.admin-settings__button--primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.admin-settings__button--primary:hover {
  background-color: var(--color-primary-600);
}

.admin-settings__button--secondary {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}

.admin-settings__button--secondary:hover {
  background-color: var(--color-background-alt);
}

.admin-settings__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 