<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BlogPostList from '@/components/organisms/admin/BlogPostList.vue';
import BlogPostEditor from '@/components/organisms/admin/BlogPostEditor.vue';
import { useBlogStore } from '@/stores/blogStore';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const blogStore = useBlogStore();
const authStore = useAuthStore();
const activeTab = ref<'list' | 'editor'>('list');
const editingPostId = ref<string | null>(null);
const isAuthorized = ref(false);

onMounted(() => {
  if (!authStore.isAdmin) {
    router.push('/');
    return;
  }
  isAuthorized.value = true;
});

const handleEditPost = (postId: string) => {
  editingPostId.value = postId;
  activeTab.value = 'editor';
};

const handleCreatePost = () => {
  editingPostId.value = null;
  activeTab.value = 'editor';
};

const handleBackToList = () => {
  activeTab.value = 'list';
  editingPostId.value = null;
};
</script>

<template>
  <div v-if="isAuthorized" class="admin-view">
    <!-- Notification -->
    <div v-if="blogStore.notification" 
         :class="['admin-view__notification', `admin-view__notification--${blogStore.notification.type}`]">
      {{ blogStore.notification.message }}
    </div>

    <header class="admin-view__header">
      <h1 class="admin-view__title">Blog Admin</h1>
      <div class="admin-view__tabs">
        <button 
          class="admin-view__tab"
          :class="{ 'admin-view__tab--active': activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          Posts
        </button>
        <button 
          class="admin-view__tab"
          :class="{ 'admin-view__tab--active': activeTab === 'editor' }"
          @click="handleCreatePost"
        >
          New Post
        </button>
      </div>
    </header>

    <main class="admin-view__content">
      <BlogPostList 
        v-if="activeTab === 'list'"
        @edit-post="handleEditPost"
      />
      <BlogPostEditor 
        v-else
        :post-id="editingPostId"
        @back="handleBackToList"
      />
    </main>
  </div>
</template>

<style scoped>
.admin-view {
  padding: var(--spacing-4);
  max-width: 1200px;
  margin: 0 auto;
}

.admin-view__header {
  margin-bottom: var(--spacing-6);
}

.admin-view__title {
  font-size: 2rem;
  color: var(--color-heading);
  margin-bottom: var(--spacing-4);
}

.admin-view__tabs {
  display: flex;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-2);
}

.admin-view__tab {
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text);
  font-weight: 500;
  transition: color 0.2s;
}

.admin-view__tab--active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.admin-view__notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius);
  color: var(--color-white);
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.admin-view__notification--success {
  background-color: var(--color-success);
}

.admin-view__notification--error {
  background-color: var(--color-error);
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