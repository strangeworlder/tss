<!--
 * NavLink
 * 
 * A navigation link component that extends Vue Router's RouterLink with additional styling and active state.
 * 
 * Features:
 * - Extends RouterLink functionality
 * - Supports active state styling
 * - Supports auth variant styling
 * - Fully accessible with keyboard navigation
 * 
 * Props:
 * - to: string (required) - The route to navigate to
 * - isActive: boolean (required) - Whether the link is currently active
 * - variant: 'default' | 'auth' (optional) - The visual variant of the link
 * 
 * Accessibility:
 * - Uses semantic RouterLink component
 * - Supports keyboard navigation
 * - No redundant ARIA attributes needed as RouterLink provides necessary accessibility
 -->

<template>
  <RouterLink
    :to="to"
    class="nav-link"
    :class="{
      'nav-link--active': isActive,
      'nav-link--auth': variant === 'auth',
    }"
  >
    <slot></slot>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

/**
 * Props interface for NavLink component
 */
interface INavLinkProps {
  /** The route to navigate to */
  to: string
  /** Whether the link is currently active */
  isActive: boolean
  /** The visual variant of the link */
  variant?: 'default' | 'auth'
}

defineProps<INavLinkProps>()
</script>

<style scoped>
.nav-link {
  color: var(--color-text);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  background-color: var(--color-background-alt);
}

.nav-link--active {
  background-color: var(--color-background-muted);
}

.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0.25rem;
  height: 0.25rem;
  background-color: var(--color-text);
  border-radius: 50%;
}

.nav-link--auth {
  background-color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
}

.nav-link--auth:hover {
  background-color: var(--color-primary-dark);
}
</style>
