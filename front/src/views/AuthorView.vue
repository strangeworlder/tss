<!--
AuthorView.vue
Component name: AuthorView
Description: Main layout view for the author dashboard
Features:
- Layout container for author dashboard
- Router view for nested routes
- Accessibility compliant
Usage:
<template>
  <AuthorView />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper semantic structure
- Screen reader support
-->

<template>
  <div class="author-view">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
// No setup needed for this component
</script>

<style scoped>
.author-view {
  min-height: 100vh;
  background-color: var(--color-background);
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