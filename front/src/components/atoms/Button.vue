<template>
  <button
    class="button"
    :class="[
      `button--${variant}`,
      { 'button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>

<style scoped>
.button {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.button--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.button--secondary {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--color-background-hover);
}

.button--danger {
  background-color: var(--color-error);
  color: var(--color-white);
}

.button--danger:hover:not(:disabled) {
  background-color: var(--color-error-dark);
}

.button--text {
  background: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-1) var(--spacing-2);
}

.button--text:hover:not(:disabled) {
  color: var(--color-text-primary);
}

.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 