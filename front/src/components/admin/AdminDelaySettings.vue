<!--
  AdminDelaySettings.vue
  Component for managing global delay settings for The Slow feature
  
  Features:
  - Display current global delay
  - Allow updating global delay
  - Show history of changes
  - Display active content overrides
  
  Props:
  - None
  
  Events:
  - delayUpdated: Emitted when the global delay is updated
  - overrideCreated: Emitted when a content override is created
  - overrideReset: Emitted when a content override is reset
  
  Accessibility considerations:
  - Uses semantic form elements with proper labels
  - Provides clear feedback for form submissions
  - Maintains proper focus management
-->
<template>
  <div class="admin-delay-settings">
    <h2 class="admin-delay-settings__title">Delay Settings</h2>
    
    <form class="admin-delay-settings__form" @submit.prevent="handleSubmit">
      <section class="admin-delay-settings__section">
        <h3 class="admin-delay-settings__section-title">Default Delays</h3>
        
        <div class="admin-delay-settings__field">
          <label for="post-delay" class="admin-delay-settings__label">
            Post Delay (minutes)
          </label>
          <input
            id="post-delay"
            v-model="settings.postDelay"
            type="number"
            min="0"
            class="admin-delay-settings__input"
            :class="{ 'admin-delay-settings__input--error': errors.postDelay }"
            @input="validatePostDelay"
          />
          <span v-if="errors.postDelay" class="admin-delay-settings__error">
            {{ errors.postDelay }}
          </span>
        </div>

        <div class="admin-delay-settings__field">
          <label for="comment-delay" class="admin-delay-settings__label">
            Comment Delay (minutes)
          </label>
          <input
            id="comment-delay"
            v-model="settings.commentDelay"
            type="number"
            min="0"
            class="admin-delay-settings__input"
            :class="{ 'admin-delay-settings__input--error': errors.commentDelay }"
            @input="validateCommentDelay"
          />
          <span v-if="errors.commentDelay" class="admin-delay-settings__error">
            {{ errors.commentDelay }}
          </span>
        </div>
      </section>

      <section class="admin-delay-settings__section">
        <h3 class="admin-delay-settings__section-title">Content Type Overrides</h3>
        
        <div class="admin-delay-settings__overrides">
          <div v-for="override in overrides" :key="override.id" class="admin-delay-settings__override">
            <div class="admin-delay-settings__override-content">
              <span class="admin-delay-settings__override-type">{{ override.contentType }}</span>
              <span class="admin-delay-settings__override-delay">{{ override.delay }} minutes</span>
            </div>
            <div class="admin-delay-settings__override-actions">
              <button
                type="button"
                class="admin-delay-settings__button admin-delay-settings__button--edit"
                @click="editOverride(override)"
                aria-label="Edit override"
              >
                Edit
              </button>
              <button
                type="button"
                class="admin-delay-settings__button admin-delay-settings__button--delete"
                @click="deleteOverride(override.id)"
                aria-label="Delete override"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="admin-delay-settings__add-override">
          <div class="admin-delay-settings__field">
            <label for="override-type" class="admin-delay-settings__label">
              Content Type
            </label>
            <select
              id="override-type"
              v-model="newOverride.contentType"
              class="admin-delay-settings__select"
              :class="{ 'admin-delay-settings__select--error': errors.overrideType }"
            >
              <option value="post">Post</option>
              <option value="comment">Comment</option>
            </select>
            <span v-if="errors.overrideType" class="admin-delay-settings__error">
              {{ errors.overrideType }}
            </span>
          </div>

          <div class="admin-delay-settings__field">
            <label for="override-delay" class="admin-delay-settings__label">
              Delay (minutes)
            </label>
            <input
              id="override-delay"
              v-model="newOverride.delay"
              type="number"
              min="0"
              class="admin-delay-settings__input"
              :class="{ 'admin-delay-settings__input--error': errors.overrideDelay }"
            />
            <span v-if="errors.overrideDelay" class="admin-delay-settings__error">
              {{ errors.overrideDelay }}
            </span>
          </div>

          <button
            type="button"
            class="admin-delay-settings__button admin-delay-settings__button--add"
            @click="addOverride"
            :disabled="isAddingOverride"
          >
            Add Override
          </button>
        </div>
      </section>

      <div class="admin-delay-settings__actions">
        <button
          type="submit"
          class="admin-delay-settings__button admin-delay-settings__button--primary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          type="button"
          class="admin-delay-settings__button admin-delay-settings__button--secondary"
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

interface ISettings {
  postDelay: number;
  commentDelay: number;
}

interface IOverride {
  id: string;
  contentType: 'post' | 'comment';
  delay: number;
}

interface IErrors {
  postDelay?: string;
  commentDelay?: string;
  overrideType?: string;
  overrideDelay?: string;
}

const authStore = useAuthStore();
const isSubmitting = ref(false);
const isAddingOverride = ref(false);

const settings = reactive<ISettings>({
  postDelay: 0,
  commentDelay: 0,
});

const overrides = ref<IOverride[]>([]);

const newOverride = reactive<Omit<IOverride, 'id'>>({
  contentType: 'post',
  delay: 0,
});

const errors = reactive<Record<string, string>>({});

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

const validateOverride = () => {
  if (!newOverride.contentType) {
    errors.overrideType = 'Please select a content type';
  } else {
    errors.overrideType = '';
  }

  if (newOverride.delay < 0) {
    errors.overrideDelay = 'Delay must be a positive number';
  } else {
    errors.overrideDelay = '';
  }

  return Object.keys(errors).length === 0;
};

const addOverride = () => {
  if (!validateOverride()) {
    return;
  }

  isAddingOverride.value = true;
  try {
    const override: IOverride = {
      id: crypto.randomUUID(),
      contentType: newOverride.contentType as 'post' | 'comment',
      delay: newOverride.delay,
    };
    overrides.value.push(override);
    newOverride.contentType = 'post';
    newOverride.delay = 0;
  } catch (error) {
    console.error('Failed to add override:', error);
  } finally {
    isAddingOverride.value = false;
  }
};

const editOverride = (override: IOverride) => {
  const index = overrides.value.findIndex((o) => o.id === override.id);
  if (index !== -1) {
    overrides.value[index] = { ...override };
  }
};

const deleteOverride = (id: string) => {
  overrides.value = overrides.value.filter((override) => override.id !== id);
};

const resetForm = () => {
  // TODO: Load default settings from API
  settings.postDelay = 0;
  settings.commentDelay = 0;
  overrides.value = [];
  for (const key of Object.keys(errors)) {
    errors[key] = '';
  }
};

const handleSubmit = async () => {
  if (Object.keys(errors).length > 0) {
    return;
  }

  isSubmitting.value = true;
  try {
    // TODO: Implement actual settings update
    await fetch('/api/admin/delay-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.state.token}`,
      },
      body: JSON.stringify({
        settings,
        overrides: overrides.value,
      }),
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.admin-delay-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.admin-delay-settings__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.admin-delay-settings__section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-md);
}

.admin-delay-settings__section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.admin-delay-settings__field {
  margin-bottom: var(--spacing-md);
}

.admin-delay-settings__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.admin-delay-settings__input,
.admin-delay-settings__select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-md);
}

.admin-delay-settings__input--error,
.admin-delay-settings__select--error {
  border-color: var(--color-danger);
}

.admin-delay-settings__error {
  display: block;
  margin-top: var(--spacing-xs);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.admin-delay-settings__overrides {
  margin-bottom: var(--spacing-lg);
}

.admin-delay-settings__override {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
}

.admin-delay-settings__override-content {
  display: flex;
  gap: var(--spacing-md);
}

.admin-delay-settings__override-type {
  font-weight: var(--font-weight-medium);
}

.admin-delay-settings__override-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.admin-delay-settings__add-override {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--spacing-md);
  align-items: end;
}

.admin-delay-settings__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.admin-delay-settings__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.admin-delay-settings__button--primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.admin-delay-settings__button--primary:hover {
  background-color: var(--color-primary-600);
}

.admin-delay-settings__button--secondary {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}

.admin-delay-settings__button--secondary:hover {
  background-color: var(--color-background-alt);
}

.admin-delay-settings__button--add {
  background-color: var(--color-success);
  color: var(--color-text-inverse);
}

.admin-delay-settings__button--add:hover {
  background-color: var(--color-success-dark);
}

.admin-delay-settings__button--edit {
  background-color: var(--color-warning);
  color: var(--color-text-inverse);
}

.admin-delay-settings__button--edit:hover {
  background-color: var(--color-warning-dark);
}

.admin-delay-settings__button--delete {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.admin-delay-settings__button--delete:hover {
  background-color: var(--color-danger-dark);
}

.admin-delay-settings__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 