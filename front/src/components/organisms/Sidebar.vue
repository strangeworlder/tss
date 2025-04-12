<!--
Sidebar.vue
Component name: Sidebar
Description: Generic sidebar navigation component for various dashboard views
Features:
- Responsive design
- Collapsible on mobile
- Active link highlighting
- Customizable navigation items
- Supports nested menu items
- Accessibility compliant
Usage:
<template>
  <Sidebar
    :items="navigationItems"
    :title="dashboardTitle"
    :collapsed="isMobile"
    @toggle="toggleSidebar"
  />
</template>
Props:
- items: INavigationItem[] - List of navigation items to display
- title: string - Title displayed at the top of the sidebar
- collapsed: boolean - Whether the sidebar is collapsed (mobile view)
- activeItemId: string - ID of the currently active navigation item
Events:
- toggle: Emitted when the sidebar toggle button is clicked
Accessibility:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
-->

<template>
  <aside
    class="sidebar"
    :class="{
      'sidebar--collapsed': collapsed,
      'sidebar--expanded': !collapsed
    }"
    aria-label="Navigation sidebar"
  >
    <div class="sidebar__header">
      <h2 class="sidebar__title">{{ title }}</h2>
      <MenuToggle
        :is-open="!collapsed"
        @toggle="$emit('toggle')"
        aria-controls="sidebar-nav"
        aria-label="Toggle sidebar navigation"
      />
    </div>

    <nav 
      id="sidebar-nav" 
      class="sidebar__nav"
      :class="{ 'sidebar__nav--visible': !collapsed }"
    >
      <ul class="sidebar__nav-list">
        <li
          v-for="item in items"
          :key="item.id"
          class="sidebar__nav-item"
        >
          <NavLink
            :to="item.to"
            :is-active="item.id === activeItemId"
            class="sidebar__nav-link"
            @click="collapsed && $emit('toggle')"
          >
            <span v-if="item.icon" class="sidebar__nav-icon">
              <!-- Icon would be rendered here -->
              {{ item.icon }}
            </span>
            <span class="sidebar__nav-label">{{ item.label }}</span>
          </NavLink>

          <ul v-if="item.children && item.children.length > 0" class="sidebar__subnav-list">
            <li
              v-for="child in item.children"
              :key="child.id"
              class="sidebar__subnav-item"
            >
              <NavLink
                :to="child.to"
                :is-active="child.id === activeItemId"
                class="sidebar__subnav-link"
                @click="collapsed && $emit('toggle')"
              >
                <span class="sidebar__subnav-label">{{ child.label }}</span>
              </NavLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MenuToggle from '../atoms/MenuToggle.vue';
import NavLink from '../molecules/NavLink.vue';

export interface INavigationItem {
  id: string;
  label: string;
  to: string;
  icon?: string;
  children?: INavigationItem[];
}

interface ISidebarProps {
  items: INavigationItem[];
  title?: string;
  collapsed?: boolean;
  activeItemId?: string;
}

const props = withDefaults(defineProps<ISidebarProps>(), {
  title: 'Navigation',
  collapsed: false,
  activeItemId: '',
});

const emit = defineEmits<(e: 'toggle') => void>();
</script>

<style scoped>
.sidebar {
  background-color: var(--color-background-alt);
  border-right: 1px solid var(--color-border);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar--expanded {
  width: 16rem;
}

.sidebar--collapsed {
  width: 4rem;
  overflow: hidden;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.sidebar__title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar__nav-list,
.sidebar__subnav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar__nav-item {
  margin: var(--spacing-xs) 0;
}

.sidebar__nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.sidebar__nav-link:hover {
  background-color: var(--color-primary-50);
}

.sidebar__nav-icon {
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

.sidebar__nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__subnav-list {
  margin-left: var(--spacing-lg);
}

.sidebar__subnav-item {
  margin: var(--spacing-xs) 0;
}

.sidebar__subnav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.sidebar__subnav-link:hover {
  background-color: var(--color-primary-50);
}

.sidebar__subnav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    min-height: 100vh;
    left: 0;
    top: 0;
  }

  .sidebar--collapsed {
    width: 0;
    border-right: none;
  }

  .sidebar--expanded {
    width: 16rem;
  }

  .sidebar__nav {
    display: block;
  }

  .sidebar__nav--visible {
    display: block;
  }
}
</style> 