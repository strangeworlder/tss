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
    <h2 class="admin-delay-settings__title">Global Delay Settings</h2>
    
    <div class="admin-delay-settings__current">
      <h3 class="admin-delay-settings__subtitle">Current Global Delay</h3>
      <p class="admin-delay-settings__delay">
        {{ formatDelay(currentDelay) }}
      </p>
    </div>
    
    <form class="admin-delay-settings__form" @submit.prevent="updateGlobalDelay">
      <div class="admin-delay-settings__form-group">
        <label for="delay-hours" class="admin-delay-settings__label">Hours</label>
        <input 
          id="delay-hours" 
          v-model.number="delayHours" 
          type="number" 
          min="0" 
          max="168" 
          class="admin-delay-settings__input"
          aria-describedby="delay-description"
        />
      </div>
      
      <div class="admin-delay-settings__form-group">
        <label for="delay-minutes" class="admin-delay-settings__label">Minutes</label>
        <input 
          id="delay-minutes" 
          v-model.number="delayMinutes" 
          type="number" 
          min="0" 
          max="59" 
          class="admin-delay-settings__input"
          aria-describedby="delay-description"
        />
      </div>
      
      <p id="delay-description" class="admin-delay-settings__description">
        Set the global delay for all new content. This will not affect content that is already scheduled.
      </p>
      
      <div class="admin-delay-settings__actions">
        <button 
          type="submit" 
          class="admin-delay-settings__button"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Updating...' : 'Update Global Delay' }}
        </button>
      </div>
    </form>
    
    <div v-if="error" class="admin-delay-settings__error">
      {{ error }}
    </div>
    
    <div v-if="success" class="admin-delay-settings__success">
      {{ success }}
    </div>
    
    <div class="admin-delay-settings__history">
      <h3 class="admin-delay-settings__subtitle">Configuration History</h3>
      <div v-if="isLoadingHistory" class="admin-delay-settings__loading">
        Loading history...
      </div>
      <div v-else-if="configHistory.length === 0" class="admin-delay-settings__empty">
        No configuration history available.
      </div>
      <ul v-else class="admin-delay-settings__history-list">
        <li 
          v-for="config in configHistory" 
          :key="config.updatedAt.toISOString()" 
          class="admin-delay-settings__history-item"
        >
          <div class="admin-delay-settings__history-date">
            {{ formatDate(config.updatedAt) }}
          </div>
          <div class="admin-delay-settings__history-value">
            {{ formatDelay(config.value as number) }}
          </div>
          <div class="admin-delay-settings__history-user">
            Updated by: {{ config.updatedBy || 'System' }}
          </div>
        </li>
      </ul>
    </div>
    
    <div class="admin-delay-settings__overrides">
      <h3 class="admin-delay-settings__subtitle">Content Overrides</h3>
      <div v-if="isLoadingOverrides" class="admin-delay-settings__loading">
        Loading overrides...
      </div>
      <div v-else-if="contentOverrides.length === 0" class="admin-delay-settings__empty">
        No active content overrides.
      </div>
      <ul v-else class="admin-delay-settings__overrides-list">
        <li 
          v-for="override in contentOverrides" 
          :key="override.contentId" 
          class="admin-delay-settings__override-item"
        >
          <div class="admin-delay-settings__override-content">
            {{ override.contentType === 'post' ? 'Post' : 'Comment' }} ID: {{ override.contentId }}
          </div>
          <div class="admin-delay-settings__override-delay">
            Delay: {{ formatDelay(override.delayOverride) }}
          </div>
          <div v-if="override.reason" class="admin-delay-settings__override-reason">
            Reason: {{ override.reason }}
          </div>
          <div v-if="override.expiresAt" class="admin-delay-settings__override-expires">
            Expires: {{ formatDate(override.expiresAt) }}
          </div>
          <div class="admin-delay-settings__override-actions">
            <button 
              @click="resetOverride(override.contentId)" 
              class="admin-delay-settings__button admin-delay-settings__button--secondary"
            >
              Reset Override
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useConfigurationStore } from '@/stores/configuration';
import { useUserStore } from '@/stores/userStore';

// Define interfaces
interface IConfigurationHistory {
  key: string;
  value: unknown;
  updatedAt: Date;
  updatedBy?: string;
}

interface IContentOverride {
  contentId: string;
  contentType: 'post' | 'comment';
  delayOverride: number;
  reason?: string;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
}

// Initialize stores
const configStore = useConfigurationStore();
const userStore = useUserStore();

// Reactive state
const currentDelay = ref<number>(24 * 60 * 60 * 1000); // Default 24 hours in milliseconds
const delayHours = ref<number>(24);
const delayMinutes = ref<number>(0);
const isSubmitting = ref<boolean>(false);
const error = ref<string>('');
const success = ref<string>('');
const configHistory = ref<IConfigurationHistory[]>([]);
const isLoadingHistory = ref<boolean>(true);
const contentOverrides = ref<IContentOverride[]>([]);
const isLoadingOverrides = ref<boolean>(true);

// Computed properties
const totalDelayMs = computed(() => {
  return delayHours.value * 60 * 60 * 1000 + delayMinutes.value * 60 * 1000;
});

// Methods
const formatDelay = (ms: number): string => {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString();
};

const updateGlobalDelay = async (): Promise<void> => {
  isSubmitting.value = true;
  error.value = '';
  success.value = '';

  try {
    await configStore.setGlobalDelay(totalDelayMs.value, userStore.currentUser?.id || 'system');

    success.value = `Global delay updated to ${formatDelay(totalDelayMs.value)}`;
    await loadCurrentDelay();
    await loadConfigHistory();
  } catch (err) {
    error.value = `Failed to update global delay: ${(err as Error).message}`;
  } finally {
    isSubmitting.value = false;
  }
};

const loadCurrentDelay = async (): Promise<void> => {
  try {
    const delay = await configStore.getGlobalDelay();
    currentDelay.value = delay;

    // Update form inputs
    delayHours.value = Math.floor(delay / (60 * 60 * 1000));
    delayMinutes.value = Math.floor((delay % (60 * 60 * 1000)) / (60 * 1000));
  } catch (err) {
    error.value = `Failed to load current delay: ${(err as Error).message}`;
  }
};

const loadConfigHistory = async (): Promise<void> => {
  isLoadingHistory.value = true;

  try {
    const history = await configStore.getConfigurationHistory('slow_feature_delay');
    configHistory.value = history.map((item: { updatedAt: string | Date }) => ({
      ...item,
      updatedAt: new Date(item.updatedAt),
    }));
  } catch (err) {
    error.value = `Failed to load configuration history: ${(err as Error).message}`;
  } finally {
    isLoadingHistory.value = false;
  }
};

const loadContentOverrides = async (): Promise<void> => {
  isLoadingOverrides.value = true;

  try {
    contentOverrides.value = await configStore.getContentOverrides();
  } catch (err) {
    error.value = `Failed to load content overrides: ${(err as Error).message}`;
  } finally {
    isLoadingOverrides.value = false;
  }
};

const resetOverride = async (contentId: string): Promise<void> => {
  try {
    await configStore.resetContentOverride(contentId);
    await loadContentOverrides();
    success.value = `Content override reset for ${contentId}`;
  } catch (err) {
    error.value = `Failed to reset content override: ${(err as Error).message}`;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await loadCurrentDelay();
  await loadConfigHistory();
  await loadContentOverrides();
});
</script>

<style scoped>
.admin-delay-settings {
  padding: var(--spacing-lg);
  background-color: var(--color-background);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-delay-settings__title {
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-xl);
  color: var(--color-text);
}

.admin-delay-settings__subtitle {
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
  color: var(--color-text);
}

.admin-delay-settings__current {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: 0.25rem;
}

.admin-delay-settings__delay {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--color-primary-700);
}

.admin-delay-settings__form {
  margin-bottom: var(--spacing-lg);
}

.admin-delay-settings__form-group {
  margin-bottom: var(--spacing-md);
}

.admin-delay-settings__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: bold;
}

.admin-delay-settings__input {
  width: 100%;
  max-width: 10rem;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  font-size: var(--font-size-md);
}

.admin-delay-settings__description {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.admin-delay-settings__actions {
  margin-top: var(--spacing-md);
}

.admin-delay-settings__button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background-color 0.2s;
}

.admin-delay-settings__button:hover {
  background-color: var(--color-primary-700);
}

.admin-delay-settings__button:disabled {
  background-color: var(--color-neutral-400);
  cursor: not-allowed;
}

.admin-delay-settings__button--secondary {
  background-color: var(--color-neutral-600);
}

.admin-delay-settings__button--secondary:hover {
  background-color: var(--color-neutral-700);
}

.admin-delay-settings__error {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--color-danger-100);
  color: var(--color-danger-700);
  border-radius: 0.25rem;
}

.admin-delay-settings__success {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--color-success-100);
  color: var(--color-success-700);
  border-radius: 0.25rem;
}

.admin-delay-settings__history,
.admin-delay-settings__overrides {
  margin-top: var(--spacing-xl);
}

.admin-delay-settings__loading,
.admin-delay-settings__empty {
  padding: var(--spacing-md);
  color: var(--color-text-secondary);
  font-style: italic;
}

.admin-delay-settings__history-list,
.admin-delay-settings__overrides-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-delay-settings__history-item,
.admin-delay-settings__override-item {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background-color: var(--color-background-alt);
  border-radius: 0.25rem;
  border-left: 4px solid var(--color-primary-500);
}

.admin-delay-settings__history-date,
.admin-delay-settings__override-content {
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.admin-delay-settings__history-value,
.admin-delay-settings__override-delay {
  color: var(--color-primary-700);
  margin-bottom: var(--spacing-xs);
}

.admin-delay-settings__history-user,
.admin-delay-settings__override-reason,
.admin-delay-settings__override-expires {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.admin-delay-settings__override-actions {
  margin-top: var(--spacing-sm);
}
</style> 