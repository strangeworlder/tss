<!--
@component AdminDelaySettings
@description A component that allows administrators to manage global delay settings for posts and comments.

@features
- Display current global delay settings for posts and comments
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
    payload: { postDelay: number, commentDelay: number }
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
import { adminService } from '@/services/AdminService';
import { featureFlagService } from '@/services/FeatureFlagService';
import AppButton from '@/components/atoms/AppButton.vue';
import FormGroup from '@/components/molecules/FormGroup.vue';
import { ButtonVariantEnum } from '@/types/button';

interface Props {
  isAdmin: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'settingsUpdated', settings: { postDelay: number; commentDelay: number }): void;
  (e: 'error', message: string): void;
}>();

const postDelay = ref(24);
const commentDelay = ref(12);
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
    postDelay.value >= minDelay.value &&
    postDelay.value <= maxDelay.value &&
    commentDelay.value >= minDelay.value &&
    commentDelay.value <= maxDelay.value &&
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
      postDelay.value = settings.postDelay;
      commentDelay.value = settings.commentDelay;
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
    const settings = {
      postDelay: postDelay.value,
      commentDelay: commentDelay.value,
      minDelay: minDelay.value,
      maxDelay: maxDelay.value,
    };

    await adminService.updateDelaySettings(settings);

    saveSuccess.value = true;
    emit('settingsUpdated', {
      postDelay: postDelay.value,
      commentDelay: commentDelay.value,
    });

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
    <h2 class="admin-delay-settings__title">Global Delay Settings</h2>
    
    <div class="admin-delay-settings__current">
      <h3 class="admin-delay-settings__subtitle">Current Delays</h3>
      <div class="admin-delay-settings__delays">
        <p class="admin-delay-settings__delay">
          Posts: {{ postDelay }} hours
        </p>
        <p class="admin-delay-settings__delay">
          Comments: {{ commentDelay }} hours
        </p>
      </div>
    </div>

    <form v-if="canEdit" class="admin-delay-settings__form" @submit.prevent="saveSettings">
      <FormGroup
        id="post-delay"
        label="Post Delay (hours)"
        :model-value="String(postDelay)"
        :error="postDelay < minDelay || postDelay > maxDelay ? 'Invalid delay value' : ''"
      >
        <input
          v-model.number="postDelay"
          type="number"
          :min="minDelay"
          :max="maxDelay"
          class="admin-delay-settings__input"
        />
      </FormGroup>

      <FormGroup
        id="comment-delay"
        label="Comment Delay (hours)"
        :model-value="String(commentDelay)"
        :error="commentDelay < minDelay || commentDelay > maxDelay ? 'Invalid delay value' : ''"
      >
        <input
          v-model.number="commentDelay"
          type="number"
          :min="minDelay"
          :max="maxDelay"
          class="admin-delay-settings__input"
        />
      </FormGroup>

      <div class="admin-delay-settings__actions">
        <AppButton
          type="submit"
          :variant="ButtonVariantEnum.PRIMARY"
          :disabled="!isFormValid || isSaving"
        >
          {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </AppButton>
        <AppButton
          type="button"
          :variant="ButtonVariantEnum.SECONDARY"
          @click="resetForm"
        >
          Reset
        </AppButton>
      </div>
    </form>

    <div v-if="saveSuccess" class="admin-delay-settings__success">
      Settings updated successfully!
    </div>
    <div v-if="errorMessage" class="admin-delay-settings__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.admin-delay-settings {
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.admin-delay-settings__title {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.admin-delay-settings__subtitle {
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.admin-delay-settings__delays {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.admin-delay-settings__delay {
  margin: 0;
  font-size: var(--font-size-md);
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
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
}

.admin-delay-settings__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.admin-delay-settings__success {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--color-success-light);
  color: var(--color-success);
  border-radius: var(--border-radius-sm);
}

.admin-delay-settings__error {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--border-radius-sm);
}
</style> 