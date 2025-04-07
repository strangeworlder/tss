<template>
  <div class="user-menu">
    <button class="user-menu__button" @click="$emit('toggle')" :aria-expanded="isOpen">
      <span class="user-menu__name">{{ userName }}</span>
      <span class="user-menu__arrow"></span>
    </button>
    <div class="user-menu__dropdown" :class="{ 'user-menu__dropdown--open': isOpen }">
      <RouterLink
        to="/profile"
        class="user-menu__link"
        :class="{ 'user-menu__link--active': isProfileActive }"
      >
        Profile
      </RouterLink>
      <button @click="$emit('logout')" class="user-menu__link user-menu__link--logout">
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  userName: string;
  isOpen: boolean;
  isProfileActive: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
  (e: 'logout'): void;
}>();
</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu__button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: none;
  border: none;
  color: var(--color-white);
  padding: var(--spacing-2) var(--spacing-3);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-fast);
}

.user-menu__button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-menu__arrow {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  transition: transform var(--transition-fast);
}

.user-menu__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast);
}

.user-menu__dropdown--open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-menu__link {
  display: block;
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.user-menu__link:hover {
  background-color: var(--color-background-secondary);
}

.user-menu__link--active {
  background-color: var(--color-background-secondary);
  color: var(--color-primary);
}

.user-menu__link--logout {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  color: var(--color-error);
}

.user-menu__link--logout:hover {
  background-color: var(--color-error-bg);
}

@media (max-width: 768px) {
  .user-menu {
    width: 100%;
  }

  .user-menu__button {
    width: 100%;
    justify-content: space-between;
  }

  .user-menu__dropdown {
    position: static;
    box-shadow: none;
    background-color: var(--color-gray-700);
    margin-top: var(--spacing-2);
    border-radius: var(--border-radius-sm);
  }

  .user-menu__link {
    color: var(--color-white);
  }

  .user-menu__link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
