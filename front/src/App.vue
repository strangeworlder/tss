<!--
 * App.vue
 * 
 * Root application component that serves as the main layout container.
 * 
 * Features:
 * - Responsive layout with header, main content area, and footer
 * - Navigation menu with user authentication state handling
 * - Notification system integration
 * - User menu with logout functionality
 * 
 * Props: None
 * 
 * Events: None
 * 
 * Accessibility:
 * - Uses semantic HTML elements (header, main, footer)
 * - Proper heading hierarchy with h1 for site title
 * - Keyboard navigation support through Vue Router
 * - No unnecessary ARIA attributes
 -->
<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { computed, ref, onMounted } from 'vue';
import NotificationList from '@/components/molecules/NotificationList.vue';
import MenuToggle from '@/components/atoms/MenuToggle.vue';
import AppNavigation from '@/components/organisms/AppNavigation.vue';

const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);
const isUserMenuOpen = ref(false);

const userFullName = computed((): string => {
  if (!authStore.user) return '';
  return `${authStore.user.firstName} ${authStore.user.lastName}`;
});

const handleLogout = async (): Promise<void> => {
  await authStore.logout();
  router.push('/auth');
};

// Close menus when clicking outside
onMounted((): void => {
  document.addEventListener('click', (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.navigation') && !target.closest('.menu-toggle')) {
      isMenuOpen.value = false;
    }
    if (!target.closest('.user-menu')) {
      isUserMenuOpen.value = false;
    }
  });
});
</script>

<template>
  <div class="app">
    <NotificationList />
    <header class="app-header">
      <div class="container app-header__container">
        <RouterLink to="/" class="app-header__logo">
          <h1 class="app-header__title">Vue Blog</h1>
        </RouterLink>

        <MenuToggle :is-open="isMenuOpen" @toggle="isMenuOpen = !isMenuOpen" />

        <AppNavigation
          :is-open="isMenuOpen"
          :is-authenticated="authStore.isAuthenticated"
          :is-admin="authStore.isAdmin"
          :user-name="userFullName"
          :is-user-menu-open="isUserMenuOpen"
          @toggle-user-menu="isUserMenuOpen = !isUserMenuOpen"
          @logout="handleLogout"
        />
      </div>
    </header>

    <main class="container app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <div class="container app-footer__container">
        <p>&copy; {{ new Date().getFullYear() }} Vue Blog. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
}

.app-header {
  background-color: var(--color-background-alt);
  color: var(--color-text-inverse);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  box-shadow: var(--shadow-sm);
  width: 100%;
}

.app-header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
  padding: 0 var(--spacing-md);
}

.app-header__logo {
  text-decoration: none;
  color: var(--color-text-inverse);
}

.app-header__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text-inverse);
}

.app-main {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.app-footer {
  background-color: var(--color-background-alt);
  color: var(--color-text-inverse);
  padding: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.app-footer__container {
  text-align: center;
}

.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
</style>
