<!--
@component UserMenu
@description A dropdown menu component for user-related actions like profile access and logout.

@features
- Toggleable dropdown menu
- Profile navigation link
- Logout functionality
- Responsive design
- Keyboard navigation support
- Screen reader support

@example
<template>
  <UserMenu
    :user-name="currentUser.name"
    :is-open="menuOpen"
    :is-profile-active="isProfileRoute"
    @toggle="toggleMenu"
    @logout="handleLogout"
  />
</template>

@props
| Name            | Type    | Default | Description                                    |
|-----------------|---------|---------|------------------------------------------------|
| userName        | string  | -       | Display name of the current user              |
| isOpen         | boolean | false   | Controls the visibility of the dropdown menu   |
| isProfileActive | boolean | false   | Indicates if profile route is currently active |

@events
| Name   | Payload | Description                                |
|--------|---------|-------------------------------------------|
| toggle | void    | Emitted when menu button is clicked       |
| logout | void    | Emitted when logout button is clicked     |

@accessibility
- Uses semantic HTML elements (button, nav)
- Implements ARIA attributes for dropdown menu
- Supports keyboard navigation
- Provides screen reader announcements
-->

<template>
  <div class="user-menu">
    <button 
      class="user-menu__button" 
      @click="$emit('toggle')" 
      :aria-expanded="isOpen"
      :aria-controls="menuId"
    >
      <span class="user-menu__name">{{ userName }}</span>
      <span class="user-menu__arrow" aria-hidden="true"></span>
    </button>

    <nav 
      :id="menuId"
      class="user-menu__dropdown" 
      :class="{ 'user-menu__dropdown--open': isOpen }"
      role="menu"
    >
      <RouterLink
        to="/profile"
        class="user-menu__link"
        :class="{ 'user-menu__link--active': isProfileActive }"
        role="menuitem"
        @click="$emit('toggle')"
      >
        Profile
      </RouterLink>
      <button 
        class="user-menu__link user-menu__link--logout"
        role="menuitem"
        @click="handleLogout"
      >
        Logout
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed } from 'vue';

// Props interface
interface IUserMenuProps {
  userName: string;
  isOpen: boolean;
  isProfileActive: boolean;
}

// Events interface
interface IUserMenuEmits {
  (e: 'toggle'): void;
  (e: 'logout'): void;
}

const emit = defineEmits<IUserMenuEmits>();

defineProps<IUserMenuProps>();

// Generate unique ID for ARIA attributes
const menuId = computed(() => `user-menu-${Math.random().toString(36).substr(2, 9)}`);

// Handler for logout to emit both events
const handleLogout = () => {
  emit('toggle'); // Close menu
  emit('logout'); // Trigger logout
};
</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu__button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--color-text);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-fast);
}

.user-menu__button:hover {
  background-color: var(--color-background-alt);
}

.user-menu__arrow {
  width: 0;
  height: 0;
  border-left: var(--spacing-xs) solid transparent;
  border-right: var(--spacing-xs) solid transparent;
  border-top: var(--spacing-xs) solid currentColor;
  transition: transform var(--transition-fast);
}

.user-menu__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-background-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  min-width: 12.5rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(calc(var(--spacing-xs) * -1));
  transition: all var(--transition-fast);
}

.user-menu__dropdown--open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-menu__link {
  display: block;
  width: 100%;
  padding: var(--spacing-md);
  color: var(--color-text);
  text-decoration: none;
  text-align: left;
  background: none;
  border: none;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.user-menu__link:hover {
  background-color: var(--color-background-alt);
}

.user-menu__link--active {
  background-color: var(--color-background-alt);
  color: var(--color-primary-500);
}

.user-menu__link--logout {
  color: var(--color-danger);
}

.user-menu__link--logout:hover {
  background-color: var(--color-danger-light);
}

@media (max-width: 48rem) {
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
    background-color: var(--color-background-alt);
    margin-top: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
  }
}
</style>
