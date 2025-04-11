<!--
@component AdminDelaySettings
@description A component that allows administrators to manage global delay settings.

@features
- Display current global delay settings
- Edit global delay settings
- View and manage content-specific overrides
- Apply changes with validation
- Show success/error notifications

@props {
  isAdmin: {
    type: boolean
    required: true
    description: "Whether the current user is an administrator"
  }
}

@events {
  settingsUpdated: {
    description: "Emitted when settings are successfully updated"
    payload: IDelaySettings
  }
  error: {
    description: "Emitted when an error occurs"
    payload: string (error message)
  }
}

@accessibility
- Uses semantic HTML elements
- Provides clear labels and instructions
- Maintains proper contrast for form elements
- Ensures keyboard navigation
-->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { adminService, type IDelaySettings } from '@/services/AdminService';
import { featureFlagService } from '@/services/FeatureFlagService';
import AppButton from '@/components/atoms/AppButton.vue';
import FormGroup from '@/components/molecules/FormGroup.vue';
import { ButtonVariantEnum } from '@/types/button';

interface Props {
  isAdmin: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'settingsUpdated', settings: IDelaySettings): void;
  (e: 'error', message: string): void;
}>();

const globalDelay = ref(24);
const minDelay = ref(1);
const maxDelay = ref(72);
const isSaving = ref(false);
const saveSuccess = ref(false);
const errorMessage = ref<string | null>(null);

const isFeatureEnabled = computed(() => {
  return featureFlagService.isFeatureEnabled('adminDelayOverride');
});

const canEdit = computed(() => {
  return props.isAdmin && isFeatureEnabled.value;
});

const isFormValid = computed(() => {
  return (
    globalDelay.value >= minDelay.value &&
    globalDelay.value <= maxDelay.value &&
    minDelay.value > 0 &&
    maxDelay.value > minDelay.value
  );
});

onMounted(async () => {
  if (canEdit.value) {
    await loadSettings();
  }
});

watch(
  () => props.isAdmin,
  async (newValue) => {
    if (newValue && isFeatureEnabled.value) {
      await loadSettings();
    }
  }
);

async function loadSettings(): Promise<void> {
  try {
    await adminService.fetchDelaySettings();
    const settings = adminService.currentDelaySettings.value;

    if (settings) {
      globalDelay.value = settings.globalDelay;
      minDelay.value = settings.minDelay;
      maxDelay.value = settings.maxDelay;
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to load settings';
    emit('error', errorMessage.value);
  }
}

async function saveSettings(): Promise<void> {
  if (!isFormValid.value) return;

  isSaving.value = true;
  errorMessage.value = null;
  saveSuccess.value = false;

  try {
    const settings: Partial<IDelaySettings> = {
      globalDelay: globalDelay.value,
      minDelay: minDelay.value,
      maxDelay: maxDelay.value,
    };

    await adminService.updateDelaySettings(settings);

    saveSuccess.value = true;
    emit('settingsUpdated', adminService.currentDelaySettings.value as IDelaySettings);

    // Reset success message after 3 seconds
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to save settings';
    emit('error', errorMessage.value);
  } finally {
    isSaving.value = false;
  }
}

function resetForm(): void {
  loadSettings();
  errorMessage.value = null;
  saveSuccess.value = false;
}
</script>

<template>
  <div class="admin-delay-settings">
    <header class="admin-delay-settings__header">
      <h2 class="admin-delay-settings__title">Global Delay Settings</h2>
      <p class="admin-delay-settings__description">
        Configure the default delay period for all scheduled content.
      </p>
    </header>

    <div v-if="!canEdit" class="admin-delay-settings__not-authorized">
      <p>You do not have permission to edit these settings.</p>
    </div>

    <form 
      v-else 
      class="admin-delay-settings__form"
      @submit.prevent="saveSettings"
    >
      <FormGroup
        id="global-delay"
        label="Global Delay (hours)"
        :model-value="String(globalDelay)"
        :error="globalDelay < minDelay || globalDelay > maxDelay ? 'Delay must be between min and max values' : ''"
      >
        <input
          v-model.number="globalDelay"
          type="number"
          min="1"
          :max="maxDelay"
          step="1"
          class="admin-delay-settings__input"
          :disabled="!canEdit || isSaving"
          aria-label="Global delay in hours"
        />
      </FormGroup>

      <div class="admin-delay-settings__range">
        <FormGroup
          id="min-delay"
          label="Minimum Delay (hours)"
          :model-value="String(minDelay)"
          :error="minDelay <= 0 ? 'Minimum delay must be greater than 0' : ''"
        >
          <input
            v-model.number="minDelay"
            type="number"
            min="1"
            :max="maxDelay - 1"
            step="1"
            class="admin-delay-settings__input"
            :disabled="!canEdit || isSaving"
            aria-label="Minimum delay in hours"
          />
        </FormGroup>

        <FormGroup
          id="max-delay"
          label="Maximum Delay (hours)"
          :model-value="String(maxDelay)"
          :error="maxDelay <= minDelay ? 'Maximum delay must be greater than minimum delay' : ''"
        >
          <input
            v-model.number="maxDelay"
            type="number"
            :min="minDelay + 1"
            step="1"
            class="admin-delay-settings__input"
            :disabled="!canEdit || isSaving"
            aria-label="Maximum delay in hours"
          />
        </FormGroup>
      </div>

      <div class="admin-delay-settings__actions">
        <AppButton
          type="submit"
          :variant="ButtonVariantEnum.PRIMARY"
          :disabled="!isFormValid || isSaving"
          aria-label="Save delay settings"
        >
          {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </AppButton>
        <AppButton
          type="button"
          :variant="ButtonVariantEnum.SECONDARY"
          @click="resetForm"
          :disabled="isSaving"
          aria-label="Reset form"
        >
          Reset
        </AppButton>
      </div>

      <div 
        v-if="saveSuccess" 
        class="admin-delay-settings__success"
        role="alert"
      >
        Settings saved successfully!
      </div>

      <div 
        v-if="errorMessage" 
        class="admin-delay-settings__error"
        role="alert"
      >
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<style scoped>
.admin-delay-settings {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-lg);
}

.admin-delay-settings__header {
  margin-bottom: var(--spacing-lg);
}

.admin-delay-settings__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--spacing-sm) 0;
}

.admin-delay-settings__description {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.admin-delay-settings__not-authorized {
  padding: var(--spacing-md);
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border-radius: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.admin-delay-settings__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.admin-delay-settings__input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  font-size: var(--font-size-md);
  background-color: var(--color-background);
  color: var(--color-text);
}

.admin-delay-settings__input:disabled {
  background-color: var(--color-background-muted);
  cursor: not-allowed;
}

.admin-delay-settings__range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.admin-delay-settings__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.admin-delay-settings__success {
  padding: var(--spacing-sm);
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-radius: var(--spacing-xs);
  margin-top: var(--spacing-md);
}

.admin-delay-settings__error {
  padding: var(--spacing-sm);
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--spacing-xs);
  margin-top: var(--spacing-md);
}
</style> 