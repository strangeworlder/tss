import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { INavigationItem } from '@/types/navigation';

export const useNavigationStore = defineStore('navigation', () => {
  const sidebarCollapsed = ref(false);
  const activeItemId = ref('');

  // Author-specific navigation items
  const authorNavigationItems: INavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      to: '/author',
      icon: '📊',
    },
    {
      id: 'content',
      label: 'Content',
      to: '/author/content',
      icon: '📝',
      children: [
        {
          id: 'content-new',
          label: 'New Content',
          to: '/author/content/new',
        },
        {
          id: 'content-drafts',
          label: 'Drafts',
          to: '/author/content/drafts',
        },
        {
          id: 'content-published',
          label: 'Published',
          to: '/author/content/published',
        },
      ],
    },
    {
      id: 'schedule',
      label: 'Schedule',
      to: '/author/schedule',
      icon: '🗓️',
    },
    {
      id: 'comments',
      label: 'Comments',
      to: '/author/comments',
      icon: '💬',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      to: '/author/analytics',
      icon: '📈',
    },
    {
      id: 'settings',
      label: 'Settings',
      to: '/author/settings',
      icon: '⚙️',
    },
  ];

  // Map route names to navigation item IDs
  const routeToIdMap: Record<string, string> = {
    'author-dashboard': 'dashboard',
    'author-content': 'content',
    'author-content-new': 'content-new',
    'author-content-drafts': 'content-drafts',
    'author-content-published': 'content-published',
    'author-schedule': 'schedule',
    'author-comments': 'comments',
    'author-analytics': 'analytics',
    'author-settings': 'settings',
  };

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const setActiveItemId = (routeName: string) => {
    activeItemId.value = routeToIdMap[routeName] || '';
  };

  return {
    sidebarCollapsed,
    activeItemId,
    authorNavigationItems,
    toggleSidebar,
    setActiveItemId,
  };
});
