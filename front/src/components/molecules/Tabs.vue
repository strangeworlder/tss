<!--
@component Tabs
@description A reusable tab navigation component that allows switching between different content sections.

@features
- Flexible tab navigation with customizable appearance
- Supports keyboard navigation
- Accessible with proper ARIA attributes
- Responsive design that works on all device sizes
- Uses semantic variables for consistent styling

@props
- modelValue: string - The currently active tab value
- tabs: Array<{ value: string, label: string }> - Array of tab objects with value and label
- variant: 'default' | 'pills' | 'underline' - Visual style variant for the tabs
- fullWidth: boolean - Whether the tabs should take up the full width of the container

@events
- update:modelValue - Emitted when the active tab changes, with the new value

@accessibility
- Uses semantic HTML elements
- Provides clear visual indication of active tab
- Ensures keyboard navigation is available
- Maintains proper color contrast ratios
-->

<template>
  <div 
    class="tabs" 
    :class="{
      'tabs--full-width': fullWidth,
      [`tabs--${variant}`]: variant
    }"
    role="tablist"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': modelValue === tab.value }"
      :aria-selected="modelValue === tab.value"
      :tabindex="modelValue === tab.value ? 0 : -1"
      @click="$emit('update:modelValue', tab.value)"
      @keydown.enter="$emit('update:modelValue', tab.value)"
      @keydown.arrow-right="focusNextTab(tab.value)"
      @keydown.arrow-left="focusPreviousTab(tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Tab {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  tabs: Tab[];
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  fullWidth: false,
});

defineEmits<(e: 'update:modelValue', value: string) => void>();

/**
 * Focuses the next tab in the sequence
 * @param currentValue - The value of the current tab
 */
const focusNextTab = (currentValue: string): void => {
  const currentIndex = props.tabs.findIndex((tab) => tab.value === currentValue);
  const nextIndex = (currentIndex + 1) % props.tabs.length;
  const nextTab = props.tabs[nextIndex];
  const nextButton = document.querySelector(`[data-tab-value="${nextTab.value}"]`) as HTMLElement;
  if (nextButton) {
    nextButton.focus();
  }
};

/**
 * Focuses the previous tab in the sequence
 * @param currentValue - The value of the current tab
 */
const focusPreviousTab = (currentValue: string): void => {
  const currentIndex = props.tabs.findIndex((tab) => tab.value === currentValue);
  const previousIndex = (currentIndex - 1 + props.tabs.length) % props.tabs.length;
  const previousTab = props.tabs[previousIndex];
  const previousButton = document.querySelector(
    `[data-tab-value="${previousTab.value}"]`
  ) as HTMLElement;
  if (previousButton) {
    previousButton.focus();
  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.tabs--full-width {
  width: 100%;
}

.tabs__tab {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  background-color: transparent;
  border: none;
  transition: all var(--transition-normal);
  color: var(--color-text);
  font-family: var(--font-family-base);
  cursor: pointer;
  position: relative;
}

.tabs__tab:hover {
  color: var(--color-text-link);
}

.tabs__tab--active {
  color: var(--color-text-link);
}

/* Default variant (underline) */
.tabs--default .tabs__tab--active {
  border-bottom: 2px solid var(--color-text-link);
}

/* Pills variant */
.tabs--pills .tabs__tab {
  border-radius: var(--border-radius);
  margin-right: var(--spacing-xs);
}

.tabs--pills .tabs__tab--active {
  background-color: var(--color-background-alt);
  border-bottom: none;
}

/* Underline variant */
.tabs--underline .tabs__tab--active {
  border-bottom: 2px solid var(--color-text-link);
}
</style> 