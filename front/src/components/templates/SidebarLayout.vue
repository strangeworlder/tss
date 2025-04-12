/**
 * SidebarLayout.vue
 * Template layout for pages with a sidebar navigation
 * 
 * Features:
 * - Responsive design
 * - Mobile-friendly with collapsible sidebar
 * - Customizable sidebar content
 * - Flexible main content area
 * 
 * Props:
 * - title: string - Title displayed in the sidebar
 * - navigationItems: INavigationItem[] - Navigation items for the sidebar
 * - activeItemId: string - ID of the currently active navigation item
 * - collapsed: boolean - Whether the sidebar is collapsed
 * 
 * Slots:
 * - main: Main content area of the page
 * 
 * Accessibility:
 * - Proper focus management
 * - Mobile-friendly navigation
 */

<template>
  <div class="sidebar-layout">
    <Sidebar
      :items="navigationItems"
      :title="title"
      :collapsed="collapsed"
      :active-item-id="activeItemId"
      @toggle="$emit('toggle')"
      class="sidebar-layout__sidebar"
    />
    
    <div 
      class="sidebar-layout__content"
      :class="{ 'sidebar-layout__content--sidebar-expanded': !collapsed }"
    >
      <div 
        v-if="!collapsed && isMobile" 
        class="sidebar-layout__overlay" 
        @click="$emit('toggle')"
      />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Sidebar, { type INavigationItem } from '../organisms/Sidebar.vue';

interface ISidebarLayoutProps {
  title?: string;
  navigationItems: INavigationItem[];
  activeItemId?: string;
  collapsed?: boolean;
}

const props = withDefaults(defineProps<ISidebarLayoutProps>(), {
  title: 'Dashboard',
  activeItemId: '',
  collapsed: false,
});

const emit = defineEmits<(e: 'toggle') => void>();

const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => {
  return windowWidth.value < 768;
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sidebar-layout {
  display: flex;
  width: 100%;
  overflow-x: hidden;
}

.sidebar-layout__sidebar {
  flex-shrink: 0;
  z-index: 100;
  height: auto;
}

.sidebar-layout__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  position: relative;
  transition: margin-left 0.3s ease;
}

.sidebar-layout__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
}

@media (min-width: 768px) {
  .sidebar-layout__overlay {
    display: none;
  }
}
</style> 