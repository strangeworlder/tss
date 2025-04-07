<!--
 * Button
 * 
 * A versatile button component that can be rendered as a button or router-link.
 * 
 * Features:
 * - Supports different visual variants (primary, secondary, danger, text)
 * - Can be rendered as a button or router-link
 * - Supports disabled state
 * - Fully accessible with proper ARIA attributes
 * - Supports keyboard navigation
 * - Follows semantic HTML principles
 * 
 * Props:
 * - variant (ButtonVariantEnum): The visual variant of the button
 *   Default: ButtonVariantEnum.PRIMARY
 * - disabled (boolean): Whether the button is disabled
 *   Default: false
 * - to (string): If provided, renders as a router-link with this destination
 *   Default: undefined
 * - ariaLabel (string): Accessible label for the button (only used when no content is provided)
 *   Default: undefined
 * 
 * Usage Examples:
 * 
 * Basic usage:
 * <Button variant="primary" @click="handleClick">
 *   Click Me
 * </Button>
 * 
 * As a router link:
 * <Button to="/some-path" variant="secondary">
 *   Navigate
 * </Button>
 * 
 * Disabled button:
 * <Button variant="primary" disabled>
 *   Disabled
 * </Button>
 * 
 * Button with no visible content:
 * <Button variant="primary" aria-label="Close dialog">
 *   <span class="visually-hidden">Close dialog</span>
 * </Button>
 * 
 * Accessibility:
 * - Uses semantic button element
 * - Provides proper ARIA attributes when needed
 * - Supports keyboard navigation
 * - Maintains sufficient color contrast
 -->
<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="button"
    :class="[`button--${variant}`, { 'button--disabled': disabled }]"
    :disabled="disabled"
    :aria-label="hasNoContent ? ariaLabel : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ButtonVariantEnum } from '@/types/button';

/**
 * Button component props interface
 */
interface IButtonProps {
  /**
   * The visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariantEnum;
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * If provided, renders as a router-link with this destination
   * @default undefined
   */
  to?: string;
  /**
   * Accessible label for the button (only used when no content is provided)
   * @default undefined
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<IButtonProps>(), {
  variant: ButtonVariantEnum.PRIMARY,
  disabled: false,
  to: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<(e: 'click', event: MouseEvent | KeyboardEvent) => void>();

/**
 * Computed property to check if the button has no visible content
 * This determines if we need to use aria-label
 */
const hasNoContent = computed(() => {
  // In a real implementation, this would check if the slot is empty
  // For simplicity, we're assuming the ariaLabel prop indicates no content
  return !!props.ariaLabel;
});

/**
 * Handles click and keyboard events
 * @param event - The event object
 */
const handleClick = (event: MouseEvent | KeyboardEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped>
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-block;
}

/* Primary button uses base variables for its specific color needs */
.button--primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
}

/* Secondary button uses semantic variables for its background and text */
.button--secondary {
  background-color: var(--color-background-alt);
  color: var(--color-text);
  border-color: var(--color-border);
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--color-background-muted);
}

/* Danger button uses semantic variables for its specific purpose */
.button--danger {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.button--danger:hover:not(:disabled) {
  background-color: var(--color-danger-dark);
}

/* Text button uses semantic variables for its text color */
.button--text {
  background: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.button--text:hover:not(:disabled) {
  color: var(--color-text);
}

.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
