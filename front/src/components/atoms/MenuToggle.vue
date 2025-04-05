<template>
  <button 
    class="menu-toggle"
    @click="$emit('toggle')"
    :aria-expanded="isOpen"
  >
    <span class="menu-toggle__icon"></span>
    <span class="visually-hidden">Toggle menu</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<style scoped>
.menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: var(--spacing-2);
  cursor: pointer;
}

.menu-toggle__icon {
  display: block;
  width: 24px;
  height: 2px;
  background-color: var(--color-white);
  position: relative;
  transition: background-color var(--transition-fast);
}

.menu-toggle__icon::before,
.menu-toggle__icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: var(--color-white);
  transition: transform var(--transition-fast);
}

.menu-toggle__icon::before {
  top: -6px;
}

.menu-toggle__icon::after {
  bottom: -6px;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
}
</style> 