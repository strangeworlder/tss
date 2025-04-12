<!--
SettingsView.vue
Component name: Settings
Description: View for managing settings
Features:
- Profile settings
- Notification preferences
- Content preferences
- Accessibility compliant
Usage:
<template>
  <Settings />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper form structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->

<template>
  <AuthorDashboardLayout title="Settings">
    <div class="author-settings">
      <h1 class="author-settings__title">Author Settings</h1>

      <form class="author-settings__form" @submit.prevent="handleSubmit">
        <section class="author-settings__section">
          <h2 class="author-settings__section-title">Profile Settings</h2>
          
          <div class="author-settings__field">
            <label for="displayName" class="author-settings__label">Display Name</label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              class="author-settings__input"
              required
            />
          </div>

          <div class="author-settings__field">
            <label for="email" class="author-settings__label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="author-settings__input"
              required
            />
          </div>

          <div class="author-settings__field">
            <label for="bio" class="author-settings__label">Bio</label>
            <textarea
              id="bio"
              v-model="form.bio"
              class="author-settings__textarea"
              rows="4"
            ></textarea>
          </div>
        </section>

        <section class="author-settings__section">
          <h2 class="author-settings__section-title">Notification Preferences</h2>
          
          <div class="author-settings__field">
            <label class="author-settings__checkbox-label">
              <input
                type="checkbox"
                v-model="form.notifications.email"
                class="author-settings__checkbox"
              />
              Email Notifications
            </label>
          </div>

          <div class="author-settings__field">
            <label class="author-settings__checkbox-label">
              <input
                type="checkbox"
                v-model="form.notifications.comments"
                class="author-settings__checkbox"
              />
              Comment Notifications
            </label>
          </div>

          <div class="author-settings__field">
            <label class="author-settings__checkbox-label">
              <input
                type="checkbox"
                v-model="form.notifications.scheduling"
                class="author-settings__checkbox"
              />
              Scheduling Notifications
            </label>
          </div>
        </section>

        <section class="author-settings__section">
          <h2 class="author-settings__section-title">Content Preferences</h2>
          
          <div class="author-settings__field">
            <label for="defaultStatus" class="author-settings__label">Default Content Status</label>
            <select
              id="defaultStatus"
              v-model="form.contentPreferences.defaultStatus"
              class="author-settings__select"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div class="author-settings__field">
            <label for="editorMode" class="author-settings__label">Editor Mode</label>
            <select
              id="editorMode"
              v-model="form.contentPreferences.editorMode"
              class="author-settings__select"
            >
              <option value="rich">Rich Text</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        </section>

        <div class="author-settings__actions">
          <button
            type="submit"
            class="author-settings__button author-settings__button--primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
          <button
            type="button"
            class="author-settings__button author-settings__button--secondary"
            @click="handleReset"
            :disabled="isSubmitting"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthorStore } from '@/stores/author';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';

const authStore = useAuthorStore();
const isSubmitting = ref(false);

const form = reactive({
  displayName: authStore.author?.name || '',
  email: authStore.author?.email || '',
  bio: '',
  notifications: {
    email: true,
    comments: true,
    scheduling: true,
  },
  contentPreferences: {
    defaultStatus: 'draft',
    editorMode: 'rich',
  },
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    // TODO: Implement settings update
    console.log('Saving settings:', form);
  } catch (error) {
    console.error('Error saving settings:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleReset = () => {
  form.displayName = authStore.author?.name || '';
  form.email = authStore.author?.email || '';
  form.bio = '';
  form.notifications = {
    email: true,
    comments: true,
    scheduling: true,
  };
  form.contentPreferences = {
    defaultStatus: 'draft',
    editorMode: 'rich',
  };
};
</script>

<style scoped>
.author-settings {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.author-settings__title {
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.author-settings__section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-md);
}

.author-settings__section-title {
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.author-settings__field {
  margin-bottom: var(--spacing-md);
}

.author-settings__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
}

.author-settings__input,
.author-settings__select,
.author-settings__textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
}

.author-settings__textarea {
  resize: vertical;
}

.author-settings__checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.author-settings__checkbox {
  width: 1.2rem;
  height: 1.2rem;
}

.author-settings__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.author-settings__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.author-settings__button--primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.author-settings__button--primary:hover {
  background-color: var(--color-primary-600);
}

.author-settings__button--secondary {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}

.author-settings__button--secondary:hover {
  background-color: var(--color-border);
}

.author-settings__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .author-settings {
    padding: var(--spacing-md);
  }

  .author-settings__section {
    padding: var(--spacing-md);
  }

  .author-settings__actions {
    flex-direction: column;
  }
}
</style> 