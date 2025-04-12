/**
 * AuthorDashboardLayout.vue
 * Layout template for the author dashboard
 * 
 * Features:
 * - Includes sidebar navigation
 * - Page title handling
 * - Content area structure
 * - Uses the SidebarLayout template
 * 
 * Props:
 * - title: string - Page title
 * 
 * Slots:
 * - default: Main content area
 * 
 * Accessibility:
 * - Inherits accessibility features from SidebarLayout
 */

<template>
  <SidebarLayout 
    :title="'Author Dashboard'" 
    :navigation-items="authorNavigationItems" 
    :active-item-id="activeItemId"
    :collapsed="sidebarCollapsed"
    @toggle="toggleSidebar"
    class="author-dashboard-layout__wrapper"
  >
    <div class="author-dashboard-layout">
      <header class="author-dashboard-layout__header">
        <h1 class="author-dashboard-layout__title">{{ title }}</h1>
      </header>
      <main class="author-dashboard-layout__content">
        <slot />
      </main>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import SidebarLayout from './SidebarLayout.vue';
import { useNavigationStore } from '@/stores/navigationStore';

interface IAuthorDashboardLayoutProps {
  title: string;
}

const props = defineProps<IAuthorDashboardLayoutProps>();
const route = useRoute();
const navigationStore = useNavigationStore();

// Use centralized state
const sidebarCollapsed = computed(() => navigationStore.sidebarCollapsed);
const activeItemId = computed(() => navigationStore.activeItemId);
const authorNavigationItems = computed(() => navigationStore.authorNavigationItems);

// Update active item when route changes
watch(
  () => route.name,
  (newRoute) => {
    console.log('Route changed:', newRoute);
    if (newRoute) {
      const routeName = newRoute.toString();
      console.log('Setting active item ID for route:', routeName);
      navigationStore.setActiveItemId(routeName);
      console.log('Current active item ID:', navigationStore.activeItemId);
    }
  },
  { immediate: true }
);

const toggleSidebar = () => {
  navigationStore.toggleSidebar();
};
</script>

<style scoped>
.author-dashboard-layout__wrapper {
  min-height: 100vh;
  display: flex;
}

.author-dashboard-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.author-dashboard-layout__header {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.author-dashboard-layout__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.author-dashboard-layout__content {
  flex: 1;
  overflow-y: auto;
}
</style> 