<template>
  <RouterLink 
    :to="to" 
    class="nav-link"
    :class="{
      'nav-link--active': isActive,
      'nav-link--auth': variant === 'auth'
    }"
  >
    <slot></slot>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  to: string;
  isActive: boolean;
  variant?: 'default' | 'auth';
}>();
</script>

<style scoped>
.nav-link {
  color: var(--color-white);
  text-decoration: none;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link--active {
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background-color: var(--color-white);
  border-radius: 50%;
}

.nav-link--auth {
  background-color: var(--color-primary);
  padding: var(--spacing-2) var(--spacing-4);
}

.nav-link--auth:hover {
  background-color: var(--color-primary-dark);
}
</style> 