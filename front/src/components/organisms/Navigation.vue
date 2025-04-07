<template>
  <nav class="navigation" :class="{ 'navigation--open': isOpen }">
    <ul class="navigation__list">
      <li v-for="item in navItems" :key="item.to">
        <NavLink :to="item.to" :is-active="$route.path === item.to" :variant="item.variant">
          {{ item.text }}
        </NavLink>
      </li>
      <li v-if="isAuthenticated">
        <UserMenu
          :user-name="userName"
          :is-open="isUserMenuOpen"
          :is-profile-active="$route.path === '/profile'"
          @toggle="toggleUserMenu"
          @logout="handleLogout"
        />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavLink from '@/components/molecules/NavLink.vue';
import UserMenu from '@/components/molecules/UserMenu.vue';

// Define the type for navigation items
interface NavItem {
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

const route = useRoute();

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
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

const toggleUserMenu = () => {
  emit('toggleUserMenu');
};

const handleLogout = () => {
  emit('logout');
};
</script>

<style scoped>
.navigation {
  transition:
    transform var(--transition-normal),
    opacity var(--transition-normal);
  background-color: var(--color-gray-800);
}

.navigation__list {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
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
    background-color: var(--color-gray-800);
    padding: var(--spacing-4);
    transform: translateX(100%);
    opacity: 0;
    z-index: 1000;
  }

  .navigation--open {
    transform: translateX(0);
    opacity: 1;
  }

  .navigation__list {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
}
</style>
