<!--
AdminLayout.vue
Component name: AdminLayout
Description: Main layout component for the admin dashboard
Features:
- Responsive navigation sidebar
- Mobile-friendly design
- Accessibility compliant
- Semantic HTML structure
- Consistent spacing and typography
Usage:
<template>
  <AdminLayout>
    <router-view />
  </AdminLayout>
</template>
Props:
- None
Slots:
- default: Main content area
Accessibility:
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
-->
<template>
  <div class="admin-layout">
    <aside class="admin-layout__sidebar">
      <nav class="admin-layout__nav" aria-label="Admin navigation">
        <div class="admin-layout__header">
          <h1 class="admin-layout__title">Admin Dashboard</h1>
        </div>
        <ul class="admin-layout__menu">
          <li v-for="item in navigationItems" :key="item.path">
            <router-link
              :to="item.path"
              class="admin-layout__menu-item"
              :class="{ 'admin-layout__menu-item--active': isActive(item.path) }"
              :aria-current="isActive(item.path) ? 'page' : undefined"
            >
              <span class="admin-layout__menu-icon" :class="item.icon"></span>
              <span class="admin-layout__menu-text">{{ item.text }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>
    <main class="admin-layout__main">
      <header class="admin-layout__topbar">
        <button
          class="admin-layout__menu-toggle"
          @click="toggleSidebar"
          aria-label="Toggle navigation menu"
          :aria-expanded="isSidebarOpen"
        >
          <span class="admin-layout__menu-toggle-icon"></span>
        </button>
        <div class="admin-layout__user">
          <span class="admin-layout__user-name">{{ userName }}</span>
          <button
            class="admin-layout__logout"
            @click="handleLogout"
            aria-label="Logout"
          >
            <span class="admin-layout__logout-icon"></span>
          </button>
        </div>
      </header>
      <div class="admin-layout__content">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isSidebarOpen = ref(true);
const userName = computed(() => authStore.user?.name || 'Admin');

const navigationItems = [
  {
    path: '/admin/dashboard',
    text: 'Dashboard',
    icon: 'icon-dashboard',
  },
  {
    path: '/admin/settings',
    text: 'Settings',
    icon: 'icon-settings',
  },
  {
    path: '/admin/users',
    text: 'Users',
    icon: 'icon-users',
  },
  {
    path: '/admin/content',
    text: 'Content',
    icon: 'icon-content',
  },
  {
    path: '/admin/monitoring',
    text: 'Monitoring',
    icon: 'icon-monitoring',
  },
  {
    path: '/admin/audit',
    text: 'Audit Log',
    icon: 'icon-audit',
  },
];

const isActive = (path: string) => route.path.startsWith(path);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
}

.admin-layout__sidebar {
  width: 16rem;
  background-color: var(--color-background-alt);
  border-right: 1px solid var(--color-border);
  transition: width 0.3s ease;
}

.admin-layout__nav {
  height: 100%;
  padding: var(--spacing-md);
}

.admin-layout__header {
  margin-bottom: var(--spacing-lg);
}

.admin-layout__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.admin-layout__menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-layout__menu-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.admin-layout__menu-item:hover {
  background-color: var(--color-background-muted);
}

.admin-layout__menu-item--active {
  background-color: var(--color-primary-100);
  color: var(--color-primary-900);
}

.admin-layout__menu-icon {
  margin-right: var(--spacing-sm);
  width: 1.5rem;
  height: 1.5rem;
}

.admin-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-layout__topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.admin-layout__menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
}

.admin-layout__user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.admin-layout__user-name {
  font-weight: var(--font-weight-medium);
}

.admin-layout__logout {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
}

.admin-layout__content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-layout__sidebar {
    width: 0;
    position: fixed;
    left: 0;
    top: 0;
    min-height: 100vh;
    z-index: 100;
  }

  .admin-layout__sidebar--open {
    width: 16rem;
  }

  .admin-layout__main {
    margin-left: 0;
  }
}
</style> 