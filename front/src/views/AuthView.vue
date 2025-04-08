<!--
@component AuthView
@description A view component that handles user authentication, providing both login and registration functionality.

@features
- Tab-based navigation between login and registration forms
- Responsive design that works on all device sizes
- Clean, accessible interface following WCAG 2.1 AA standards
- Uses semantic variables for consistent styling

@props
- None (this is a view component with no props)

@events
- None (this is a view component with no events)

@accessibility
- Uses semantic HTML elements
- Provides clear visual indication of active tab
- Ensures keyboard navigation is available
- Maintains proper color contrast ratios
-->

<template>
  <div class="auth-view">
    <div class="auth-view__container">
      <Tabs
        v-model="activeTab"
        :tabs="authTabs"
        full-width
      />

      <div class="auth-view__content">
        <LoginForm v-if="activeTab === 'login'" />
        <RegisterForm v-if="activeTab === 'register'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LoginForm from '@/components/organisms/LoginForm.vue';
import RegisterForm from '@/components/organisms/RegisterForm.vue';
import Tabs from '@/components/molecules/Tabs.vue';

const activeTab = ref<'login' | 'register'>('login');

const authTabs = computed(() => [
  { value: 'login', label: 'Login' },
  { value: 'register', label: 'Register' },
]);
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background-muted);
  padding: var(--spacing-xl) var(--spacing-md);
}

.auth-view__container {
  width: 100%;
  max-width: 520px;
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.auth-view__content {
  padding: var(--spacing-md);
}
</style>
