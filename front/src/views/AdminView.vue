<!--
  AdminView.vue
  Admin interface for managing blog posts.

  Features:
  - List view of all blog posts
  - Create new posts
  - Edit existing posts
  - Toggle between list and editor views
  - Admin-only access

  Usage:
  <AdminView />

  Props: None

  Events: None

  Accessibility:
  - Uses semantic HTML elements
  - Proper heading hierarchy
  - Keyboard navigation support
  - Protected route for admin users only
-->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { TabItem } from '@/types/tabs';
import BlogPostList from '@/components/organisms/admin/BlogPostList.vue';
import BlogPostEditor from '@/components/organisms/admin/BlogPostEditor.vue';
import { useBlogStore } from '@/stores/blogStore';
import { useAuthStore } from '@/stores/authStore';
import BaseView from '@/components/templates/BaseView.vue';
import Tabs from '@/components/molecules/Tabs.vue';

const router = useRouter();
const blogStore = useBlogStore();
const authStore = useAuthStore();
const activeTab = ref<'list' | 'editor'>('list');
const editingPostId = ref<string | null>(null);
const isAuthorized = ref<boolean>(false);

onMounted((): void => {
  if (!authStore.isAdmin) {
    router.push('/');
    return;
  }
  isAuthorized.value = true;
});

const handleEditPost = (postId: string): void => {
  editingPostId.value = postId;
  activeTab.value = 'editor';
};

const handleCreatePost = (): void => {
  editingPostId.value = null;
  activeTab.value = 'editor';
};

const handleBackToList = (): void => {
  activeTab.value = 'list';
  editingPostId.value = null;
};

const adminTabs = computed<TabItem[]>(() => [
  { value: 'list', label: 'Posts' },
  { value: 'editor', label: 'New Post' },
]);
</script>

<template>
  <BaseView 
    title="Blog Admin" 
    variant="narrow"
    role="main"
    aria-label="Blog administration"
  >
    <template #header>
      <div class="admin-view__header">
        <h1 class="admin-view__title">Blog Admin</h1>
        <Tabs
          v-model="activeTab"
          :tabs="adminTabs"
          @update:modelValue="(value) => value === 'editor' && handleCreatePost()"
          aria-label="Admin view sections"
        />
      </div>
    </template>
    
    <main class="admin-view__content">
      <BlogPostList 
        v-if="activeTab === 'list'" 
        @edit-post="handleEditPost"
        aria-label="Blog posts list"
      />
      <BlogPostEditor 
        v-else 
        :post-id="editingPostId" 
        @back="handleBackToList"
        aria-label="Blog post editor"
      />
    </main>
  </BaseView>
</template>

<style scoped>
.admin-view {
  padding: var(--spacing-md);
  max-width: 75rem;
  margin: 0 auto;
}

.admin-view__header {
  margin-bottom: var(--spacing-lg);
}

.admin-view__title {
  font-size: var(--font-size-2xl);
  color: var(--color-heading);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-bold);
}

.admin-view__content {
  padding: var(--spacing-md);
}

.admin-view__notification {
  position: fixed;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-medium);
  z-index: var(--z-index-notification);
  animation: slideIn var(--transition-normal);
}

.admin-view__notification--success {
  background-color: var(--color-success);
}

.admin-view__notification--error {
  background-color: var(--color-danger);
}

.admin-view__notification--info {
  background-color: var(--color-info);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
