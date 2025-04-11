<!--
@component PendingUpdatePreview
@description A component that displays a preview of pending content updates with diff highlighting.

@features
- Shows original and updated content side by side
- Highlights content differences
- Displays update metadata
- Provides actions to apply or cancel update
- Shows update timer

@props {
  originalContent: {
    type: string
    required: true
    description: "The current published content"
  }
  updatedContent: {
    type: string
    required: true
    description: "The pending updated content"
  }
  publishAt: {
    type: Date
    required: true
    description: "When the update will be published"
  }
  updateId: {
    type: string
    required: true
    description: "ID of the pending update"
  }
  version: {
    type: number
    required: true
    description: "Version number of the update"
  }
}

@events {
  apply: {
    description: "Emitted when apply button is clicked"
    payload: string (update ID)
  }
  cancel: {
    description: "Emitted when cancel button is clicked"
    payload: string (update ID)
  }
}

@accessibility
- Uses semantic HTML elements
- Provides ARIA labels for diffs
- Maintains proper contrast for diff highlighting
- Ensures keyboard navigation
-->

<script setup lang="ts">
import { computed } from 'vue';
import ScheduledPostTimer from './ScheduledPostTimer.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';
import { diffWords } from 'diff';

interface Props {
  originalContent: string;
  updatedContent: string;
  publishAt: Date;
  updateId: string;
  version: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'apply', id: string): void;
  (e: 'cancel', id: string): void;
}>();

const contentDiff = computed(() => {
  return diffWords(props.originalContent, props.updatedContent);
});

function handleApply(): void {
  emit('apply', props.updateId);
}

function handleCancel(): void {
  emit('cancel', props.updateId);
}
</script>

<template>
  <div class="pending-update">
    <header class="pending-update__header">
      <h3 class="pending-update__title">
        Pending Update
        <span class="pending-update__version">v{{ version }}</span>
      </h3>
      <div class="pending-update__actions">
        <AppButton
          :variant="ButtonVariantEnum.PRIMARY"
          @click="handleApply"
          aria-label="Apply update now"
        >
          Apply Now
        </AppButton>
        <AppButton
          :variant="ButtonVariantEnum.DANGER"
          @click="handleCancel"
          aria-label="Cancel update"
        >
          Cancel
        </AppButton>
      </div>
    </header>

    <div class="pending-update__timer">
      <ScheduledPostTimer
        :content-id="updateId"
        :publish-at="publishAt"
        status="scheduled"
      />
    </div>

    <div class="pending-update__content">
      <div class="pending-update__diff">
        <h4 class="pending-update__diff-title">Content Changes</h4>
        <div 
          class="pending-update__diff-content"
          role="region"
          aria-label="Content changes preview"
        >
          <template v-for="(part, index) in contentDiff" :key="index">
            <span
              :class="{
                'diff-added': part.added,
                'diff-removed': part.removed
              }"
              :aria-label="part.added ? 'Added text' : part.removed ? 'Removed text' : 'Unchanged text'"
            >
              {{ part.value }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pending-update {
  border: 1px solid var(--color-border);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-md);
  background-color: var(--color-background);
}

.pending-update__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.pending-update__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.pending-update__version {
  font-size: var(--font-size-sm);
  font-family: var(--font-family-mono);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background-alt);
  border-radius: var(--spacing-xs);
}

.pending-update__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.pending-update__timer {
  margin-bottom: var(--spacing-md);
}

.pending-update__content {
  background-color: var(--color-background-alt);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-md);
}

.pending-update__diff-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin: 0 0 var(--spacing-sm) 0;
}

.pending-update__diff-content {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.diff-added {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  text-decoration: none;
}

.diff-removed {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  text-decoration: line-through;
}
</style> 