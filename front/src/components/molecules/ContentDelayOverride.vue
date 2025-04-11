<!--
@component ContentDelayOverride
@description A component that allows administrators to manage content-specific delay overrides.

@features
- Display current delay override for specific content
- Add or update delay override
- Set expiration date for override
- Provide reason for override
- Show success/error notifications

@props {
  contentId: {
    type: string
    required: true
    description: "ID of the content to override"
  }
  isAdmin: {
    type: boolean
    required: true
    description: "Whether the current user is an administrator"
  }
}

@events {
  overrideUpdated: {
    description: "Emitted when override is successfully updated"
    payload: IContentDelayOverride
  }
  overrideRemoved: {
    description: "Emitted when override is removed"
    payload: string (content ID)
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
import { adminService, type IContentDelayOverride } from '@/services/AdminService';
import { featureFlagService } from '@/services/FeatureFlagService';
import AppButton from '@/components/atoms/AppButton.vue';
import FormGroup from '@/components/molecules/FormGroup.vue';
import { ButtonVariantEnum } from '@/types/button';

interface Props {
  contentId: string;
  isAdmin: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'overrideUpdated', override: IContentDelayOverride): void;
  (e: 'overrideRemoved', contentId: string): void;
  (e: 'error', message: string): void;
}>();

const delay = ref(24);
const reason = ref('');
const expiresAt = ref<Date | null>(null);
const isSaving = ref(false);
const saveSuccess = ref(false);
const errorMessage = ref<string | null>(null);
const hasOverride = ref(false);

const isFeatureEnabled = computed(() => {
  return featureFlagService.isFeatureEnabled('adminDelayOverride');
});

const canEdit = computed(() => {
  return props.isAdmin && isFeatureEnabled.value;
});

const isFormValid = computed(() => {
  return delay.value > 0 && reason.value.trim().length > 0;
});

onMounted(async () => {
  if (canEdit.value) {
    await loadOverride();
  }
});

watch(
  () => props.contentId,
  async (newValue) => {
    if (canEdit.value && newValue) {
      await loadOverride();
    }
  }
);

async function loadOverride(): Promise<void> {
  try {
    await adminService.fetchContentOverrides();
    const overrides = adminService.currentContentOverrides.value;
    const override = overrides.get(props.contentId);

    if (override) {
      delay.value = override.delay;
      reason.value = override.reason;
      expiresAt.value = override.expiresAt || null;
      hasOverride.value = true;
    } else {
      resetForm();
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to load override';
    emit('error', errorMessage.value);
  }
}

async function saveOverride(): Promise<void> {
  if (!isFormValid.value) return;

  isSaving.value = true;
  errorMessage.value = null;
  saveSuccess.value = false;

  try {
    const override: IContentDelayOverride = {
      contentId: props.contentId,
      delay: delay.value,
      reason: reason.value,
      expiresAt: expiresAt.value || undefined,
      createdAt: new Date(),
      createdBy: 'admin', // TODO: Get actual user ID
    };

    await adminService.updateContentOverride(override);

    saveSuccess.value = true;
    hasOverride.value = true;
    emit('overrideUpdated', override);

    // Reset success message after 3 seconds
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to save override';
    emit('error', errorMessage.value);
  } finally {
    isSaving.value = false;
  }
}

async function removeOverride(): Promise<void> {
  isSaving.value = true;
  errorMessage.value = null;
  saveSuccess.value = false;

  try {
    await adminService.removeContentOverride(props.contentId);

    saveSuccess.value = true;
    hasOverride.value = false;
    emit('overrideRemoved', props.contentId);
    resetForm();

    // Reset success message after 3 seconds
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to remove override';
    emit('error', errorMessage.value);
  } finally {
    isSaving.value = false;
  }
}

function resetForm(): void {
  delay.value = 24;
  reason.value = '';
  expiresAt.value = null;
  hasOverride.value = false;
  errorMessage.value = null;
  saveSuccess.value = false;
}
</script>

<template>
  <div class="content-delay-override">
    <header class="content-delay-override__header">
      <h3 class="content-delay-override__title">
        {{ hasOverride ? 'Update Delay Override' : 'Add Delay Override' }}
      </h3>
      <p class="content-delay-override__description">
        Override the publication delay for this specific content.
      </p>
    </header>

    <div v-if="!canEdit" class="content-delay-override__not-authorized">
      <p>You do not have permission to manage delay overrides.</p>
    </div>

    <form 
      v-else 
      class="content-delay-override__form"
      @submit.prevent="saveOverride"
    >
      <FormGroup
        id="override-delay"
        label="Delay (hours)"
        :model-value="String(delay)"
        :error="delay <= 0 ? 'Delay must be greater than 0' : ''"
      >
        <input
          v-model.number="delay"
          type="number"
          min="1"
          step="1"
          class="content-delay-override__input"
          :disabled="!canEdit || isSaving"
          aria-label="Override delay in hours"
        />
      </FormGroup>

      <FormGroup
        id="override-reason"
        label="Reason"
        :model-value="reason"
        :error="!reason.trim() ? 'Reason is required' : ''"
      >
        <textarea
          v-model="reason"
          class="content-delay-override__textarea"
          :disabled="!canEdit || isSaving"
          aria-label="Override reason"
          placeholder="Explain why this content needs a custom delay"
        />
      </FormGroup>

      <FormGroup
        id="override-expiration"
        label="Expiration Date (optional)"
        :model-value="expiresAt ? expiresAt.toISOString().split('T')[0] : ''"
      >
        <input
          v-model="expiresAt"
          type="date"
          class="content-delay-override__input"
          :disabled="!canEdit || isSaving"
          aria-label="Override expiration date"
          :min="new Date().toISOString().split('T')[0]"
        />
      </FormGroup>

      <div class="content-delay-override__actions">
        <AppButton
          type="submit"
          :variant="ButtonVariantEnum.PRIMARY"
          :disabled="!isFormValid || isSaving"
          aria-label="Save delay override"
        >
          {{ isSaving ? 'Saving...' : hasOverride ? 'Update Override' : 'Add Override' }}
        </AppButton>
        <AppButton
          v-if="hasOverride"
          type="button"
          :variant="ButtonVariantEnum.DANGER"
          @click="removeOverride"
          :disabled="isSaving"
          aria-label="Remove override"
        >
          Remove Override
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
        class="content-delay-override__success"
        role="alert"
      >
        {{ hasOverride ? 'Override updated successfully!' : 'Override removed successfully!' }}
      </div>

      <div 
        v-if="errorMessage" 
        class="content-delay-override__error"
        role="alert"
      >
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<style scoped>
.content-delay-override {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-lg);
}

.content-delay-override__header {
  margin-bottom: var(--spacing-lg);
}

.content-delay-override__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--spacing-sm) 0;
}

.content-delay-override__description {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.content-delay-override__not-authorized {
  padding: var(--spacing-md);
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border-radius: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.content-delay-override__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.content-delay-override__input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  font-size: var(--font-size-md);
  background-color: var(--color-background);
  color: var(--color-text);
}

.content-delay-override__textarea {
  width: 100%;
  min-height: 5rem;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  font-size: var(--font-size-md);
  background-color: var(--color-background);
  color: var(--color-text);
  resize: vertical;
}

.content-delay-override__input:disabled,
.content-delay-override__textarea:disabled {
  background-color: var(--color-background-muted);
  cursor: not-allowed;
}

.content-delay-override__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.content-delay-override__success {
  padding: var(--spacing-sm);
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-radius: var(--spacing-xs);
  margin-top: var(--spacing-md);
}

.content-delay-override__error {
  padding: var(--spacing-sm);
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--spacing-xs);
  margin-top: var(--spacing-md);
}
</style> 