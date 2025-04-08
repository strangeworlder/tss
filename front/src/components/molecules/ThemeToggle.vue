<!--
  ThemeToggle Component
  A component that allows users to switch between themes and color modes.

  Features:
  - Toggle between light and dark mode
  - Switch between different themes (for authenticated users)
  - Persists theme preferences
  - Accessible controls
  - Responsive design

  Usage:
  ```vue
  <template>
    <ThemeToggle />
  </template>
  ```

  Accessibility:
  - Uses semantic HTML elements
  - Provides clear aria-labels
  - Maintains proper color contrast
  - Keyboard navigable
-->

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import DropdownMenu from './DropdownMenu.vue';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const isThemeMenuOpen = ref(false);

const themes = ['steampunk', 'horror'] as const;
const currentTheme = computed(() => themeStore.currentTheme);
const colorMode = computed(() => themeStore.colorMode);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const toggleColorMode = () => {
  themeStore.setColorMode(colorMode.value === 'light' ? 'dark' : 'light');
};

const setTheme = (theme: (typeof themes)[number]) => {
  themeStore.setTheme(theme);
  isThemeMenuOpen.value = false;
};

const toggleThemeMenu = () => {
  isThemeMenuOpen.value = !isThemeMenuOpen.value;
};
</script>

<template>
  <div class="theme-toggle">
    <button
      class="theme-toggle__button"
      @click="toggleColorMode"
      :aria-label="colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
    >
      <span class="theme-toggle__icon">
        {{ colorMode === 'light' ? '🌙' : '☀️' }}
      </span>
    </button>
    
    <DropdownMenu 
      v-if="isAuthenticated" 
      :is-open="isThemeMenuOpen"
      @toggle="toggleThemeMenu"
    >
      <template #trigger>
        <button 
          class="theme-toggle__theme-button"
          :aria-label="`Current theme: ${currentTheme}`"
        >
          <span class="theme-toggle__theme-icon">🎨</span>
        </button>
      </template>
      <template #menu>
        <button
          v-for="theme in themes"
          :key="theme"
          class="theme-toggle__option"
          :class="{ 'theme-toggle__option--active': currentTheme === theme }"
          @click="setTheme(theme)"
        >
          {{ theme }}
        </button>
      </template>
    </DropdownMenu>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.theme-toggle__button,
.theme-toggle__theme-button {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-text);
  transition: color var(--transition-fast);
}

.theme-toggle__button:hover,
.theme-toggle__theme-button:hover {
  color: var(--color-text-secondary);
}

.theme-toggle__icon,
.theme-toggle__theme-icon {
  font-size: var(--font-size-xl);
}

.theme-toggle__option {
  display: block;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.theme-toggle__option:hover {
  background-color: var(--color-background-alt);
}

.theme-toggle__option--active {
  color: var(--color-primary-500);
  font-weight: var(--font-weight-medium);
}
</style> 