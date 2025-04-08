<!--
 * MenuToggle
 * 
 * A button component that toggles a menu's open/closed state.
 * 
 * Features:
 * - Toggles between open and closed states
 * - Animated hamburger icon
 * - Responsive (only visible on mobile)
 * - Accessible with proper ARIA attributes
 * 
 * Props:
 * - isOpen (boolean): Controls the open/closed state of the menu
 *   Default: false
 * 
 * Usage Examples:
 * 
 * Basic usage:
 * &lt;MenuToggle :is-open="isMenuOpen" @toggle="toggleMenu" /&gt;
 * 
 * With navigation:
 * &lt;div&gt;
 *   &lt;MenuToggle :is-open="isMenuOpen" @toggle="toggleMenu" /&gt;
 *   &lt;nav v-show="isMenuOpen"&gt;
 *     &lt;!-- Menu content --&gt;
 *   &lt;/nav&gt;
 * &lt;/div&gt;
 * 
 * Script setup:
 * import { ref } from 'vue'
 * import MenuToggle from '@/components/atoms/MenuToggle.vue'
 * 
 * const isMenuOpen = ref(false)
 * 
 * const toggleMenu = () => {
 *   isMenuOpen.value = !isMenuOpen.value
 * }
 * 
 * Accessibility:
 * - Uses semantic button element
 * - Provides aria-expanded attribute for screen readers
 * - Includes aria-label for clear purpose indication
 -->
<template>
  <AppButton
    :variant="ButtonVariantEnum.TEXT"
    class="menu-toggle"
    @click="$emit('toggle')"
    :aria-expanded="isOpen"
    :aria-label="'Toggle menu'"
  >
    <span class="menu-toggle__icon"></span>
  </AppButton>
</template>

<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';

interface IMenuToggleProps {
  isOpen: boolean;
}

withDefaults(defineProps<IMenuToggleProps>(), {
  isOpen: false,
});

defineEmits<(e: 'toggle') => void>();
</script>

<style scoped>
.menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: var(--spacing-sm);
}

.menu-toggle__icon {
  display: block;
  width: 1.5rem;
  height: 0.125rem;
  background-color: var(--color-text);
  position: relative;
  transition: background-color var(--transition-fast);
}

.menu-toggle__icon::before,
.menu-toggle__icon::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 0.125rem;
  background-color: var(--color-text);
  transition: transform var(--transition-fast);
}

.menu-toggle__icon::before {
  top: -0.375rem;
}

.menu-toggle__icon::after {
  bottom: -0.375rem;
}

@media (max-width: 48rem) {
  .menu-toggle {
    display: block;
  }
}
</style>
