<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/components/atoms/Button.vue'
import { ButtonVariantEnum } from '@/types/button'

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
  <Button @click="handleNavigation" class="back-button" :variant="ButtonVariantEnum.TEXT">
    &larr; {{ text }}
  </Button>
</template>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.back-button:hover {
  color: var(--color-text-link);
}

.back-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
</style>
