<!--
AuthorSidebar.vue
Component name: AuthorSidebar
Description: Author-specific implementation of the sidebar navigation
Features:
- Author-specific navigation items
- Uses the generic Sidebar component
- Customized for author workflows
Usage:
<template>
  <AuthorSidebar :active-route="$route.name" />
</template>
Props:
- activeRoute: string - Current active route name
Accessibility:
- Inherits accessibility features from Sidebar component
-->

<template>
  <Sidebar
    :items="authorNavigationItems"
    :title="'Author Dashboard'"
    :active-item-id="activeItemId"
    :collapsed="sidebarCollapsed"
    @toggle="toggleSidebar"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import Sidebar, { type INavigationItem } from '../Sidebar.vue';
import { useNavigationStore } from '@/stores/navigationStore';

interface IAuthorSidebarProps {
  activeRoute?: string;
}

const props = withDefaults(defineProps<IAuthorSidebarProps>(), {
  activeRoute: '',
});

const emit = defineEmits<(e: 'toggle') => void>();

const navigationStore = useNavigationStore();

// Use centralized state
const sidebarCollapsed = computed(() => navigationStore.sidebarCollapsed);
const activeItemId = computed(() => navigationStore.activeItemId);
const authorNavigationItems = computed(() => navigationStore.authorNavigationItems);

// Update active item when route changes
watch(
  () => props.activeRoute,
  (newRoute) => {
    if (newRoute) {
      navigationStore.setActiveItemId(newRoute);
    }
  },
  { immediate: true }
);

const toggleSidebar = () => {
  navigationStore.toggleSidebar();
  emit('toggle');
};
</script> 