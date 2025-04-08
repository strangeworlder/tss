<!--
AppNavigation Component

A main navigation component that renders the site's primary navigation links and user menu.

Features:
- Responsive navigation with mobile menu support
- Dynamic navigation items based on authentication state
- Integrated user menu for authenticated users
- Admin section access for admin users
- Mobile-friendly collapsible menu
- Theme toggle for light/dark mode and theme selection

Usage:
```vue
<AppNavigation
  :is-open="navigationOpen"
  :is-authenticated="userIsAuthenticated"
  :is-admin="userIsAdmin"
  :user-name="currentUserName"
  :is-user-menu-open="userMenuOpen"
  @toggle-user-menu="handleUserMenuToggle"
  @logout="handleLogout"
/>
```

Props:
| Name            | Type      | Default | Description                                     |
|-----------------|-----------|---------|------------------------------------------------|
| isOpen          | boolean   | false   | Controls navigation visibility on mobile        |
| isAuthenticated | boolean   | false   | User authentication state                      |
| isAdmin         | boolean   | false   | User admin status                              |
| userName        | string    | ''      | Display name for authenticated user            |
| isUserMenuOpen  | boolean   | false   | Controls user menu dropdown state             |

Events:
| Name           | Payload | Description                           |
|----------------|---------|---------------------------------------|
| toggleUserMenu | void    | Emitted when user menu is toggled    |
| logout         | void    | Emitted when logout action triggered |

Accessibility:
- Uses semantic navigation elements
- Keyboard navigation support
- Screen reader announcements for menu state
- ARIA labels for navigation regions
-->

<template>
  <nav 
    class="navigation" 
    :class="{ 'navigation--open': isOpen }"
    :aria-expanded="isOpen"
    @keydown="handleKeyDown"
  >
    <ul class="navigation__list">
      <li 
        v-for="(item, index) in navItems" 
        :key="item.to"
      >
        <NavLink 
          :to="item.to" 
          :is-active="$route.path === item.to" 
          :variant="item.variant"
          :tabindex="currentFocusIndex === index ? 0 : -1"
          @keydown.left="handleLeftKey(index)"
          @keydown.right="handleRightKey(index)"
          @focus="currentFocusIndex = index"
        >
          {{ item.text }}
        </NavLink>
      </li>
      <li>
        <ThemeToggle />
      </li>
      <li v-if="isAuthenticated">
        <UserMenu
          :user="{ displayName: userName }"
          :is-open="isUserMenuOpen"
          @toggle="toggleUserMenu"
        />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ComputedRef } from 'vue';
import NavLink from '@/components/molecules/NavLink.vue';
import UserMenu from '@/components/molecules/UserMenu.vue';
import ThemeToggle from '@/components/molecules/ThemeToggle.vue';

interface INavItem {
  to: string;
  text: string;
  variant?: 'default' | 'auth';
}

const props = defineProps<{
  isOpen: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userName: string;
  isUserMenuOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleUserMenu'): void;
  (e: 'logout'): void;
}>();

// Keyboard navigation state
const currentFocusIndex = ref<number>(0);

const navItems: ComputedRef<INavItem[]> = computed(() => {
  const items: INavItem[] = [
    { to: '/', text: 'Home' },
    { to: '/blog', text: 'Blog' },
    { to: '/about', text: 'About' },
  ];

  if (props.isAdmin) {
    items.push({ to: '/admin', text: 'Admin' });
  }

  if (!props.isAuthenticated) {
    items.push({ to: '/auth', text: 'Login / Register', variant: 'auth' });
  }

  return items;
});

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('toggleUserMenu');
  }
};

const handleLeftKey = (currentIndex: number): void => {
  const maxIndex = props.isAuthenticated ? navItems.value.length : navItems.value.length - 1;
  currentFocusIndex.value = currentIndex === 0 ? maxIndex : currentIndex - 1;
  focusCurrentItem();
};

const handleRightKey = (currentIndex: number): void => {
  const maxIndex = props.isAuthenticated ? navItems.value.length : navItems.value.length - 1;
  currentFocusIndex.value = currentIndex === maxIndex ? 0 : currentIndex + 1;
  focusCurrentItem();
};

const focusCurrentItem = (): void => {
  const menuItems = document.querySelectorAll('a, button');
  (menuItems[currentFocusIndex.value] as HTMLElement)?.focus();
};

const toggleUserMenu = (): void => {
  emit('toggleUserMenu');
};

const handleLogout = (): void => {
  emit('logout');
};
</script>

<style scoped>
.navigation {
  transition:
    transform var(--transition-normal),
    opacity var(--transition-normal);
  background-color: var(--color-background-alt);
  outline: none;
}

.navigation__list {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (max-width: 768px) {
  .navigation {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-background-alt);
    padding: var(--spacing-md);
    transform: translateX(100%);
    opacity: 0;
    z-index: var(--z-index-modal);
  }

  .navigation--open {
    transform: translateX(0);
    opacity: 1;
  }

  .navigation__list {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
}

/* Focus management styles */
.navigation a:focus,
.navigation button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
}

/* Ensure focus is visible in high contrast mode */
@media (forced-colors: active) {
  .navigation a:focus,
  .navigation button:focus {
    outline: 2px solid CanvasText;
  }
}
</style>
