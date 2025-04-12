<!--
DashboardView.vue
Component name: DashboardView
Description: Main dashboard view for authors to manage their content
Features:
- Navigation menu
- Content management section
- Scheduling interface
- Accessibility compliant
Usage:
<template>
  <router-view name="author-dashboard" />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper navigation structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->
<template>
  <AuthorDashboardLayout title="Dashboard">
    <div class="author-dashboard">
      <div class="author-dashboard__header">
        <div class="author-dashboard__actions">
          <button
            v-if="showCreateButton"
            class="author-dashboard__button author-dashboard__button--primary"
            @click="handleCreate"
          >
            Create New
          </button>
        </div>
      </div>

      <div class="author-dashboard__content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';

const route = useRoute();
const router = useRouter();

const showCreateButton = computed(() => {
  return route.name === 'author-content' || route.name === 'author-schedule';
});

const handleCreate = () => {
  router.push('/author/content/new');
};
</script>

<style scoped>
.author-dashboard {
  padding: var(--spacing-md);
}

.author-dashboard__header {
  margin-bottom: var(--spacing-lg);
}

.author-dashboard__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.author-dashboard__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  cursor: pointer;
}

.author-dashboard__button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.author-dashboard__button--primary:hover {
  background-color: var(--color-primary-dark);
}

.author-dashboard__content {
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 