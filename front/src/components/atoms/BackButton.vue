<script setup lang="ts">
import { useRouter } from 'vue-router'

/**
 * BackButton Component
 *
 * A reusable button component that navigates back to a specified route.
 * Follows accessibility guidelines and provides keyboard navigation.
 *
 * @example
 * <BackButton
 *   text="Back to Home"
 *   to="/home"
 * />
 */

/**
 * BackButton component props interface
 */
interface IProps {
  /**
   * Text to display on the button
   * @default 'Back'
   */
  text?: string
  /**
   * Route to navigate to when clicked
   * @default '/'
   */
  to?: string
}

const props = withDefaults(defineProps<IProps>(), {
  text: 'Back',
  to: '/',
})

const router = useRouter()

/**
 * Handles navigation when button is clicked or keyboard is used
 */
const handleNavigation = () => {
  console.log('Navigating to:', props.to)
  router.push(props.to)
}
</script>

<template>
  <button 
    @click="handleNavigation"
    @keydown.enter="handleNavigation"
    class="back-button"
    :aria-label="`${text} button`"
    role="button"
    tabindex="0"
  >
    &larr; {{ text }}
  </button>
</template>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.back-button:hover {
  color: var(--color-text-link);
}

.back-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
</style>
