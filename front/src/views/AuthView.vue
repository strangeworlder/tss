<template>
  <div class="auth-view">
    <div class="auth-view__container">
      <div class="auth-view__tabs">
        <button
          class="auth-view__tab-btn"
          :class="{ 'auth-view__tab-btn--active': activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button
          class="auth-view__tab-btn"
          :class="{ 'auth-view__tab-btn--active': activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>

      <div class="auth-view__content">
        <LoginForm v-if="activeTab === 'login'" />
        <RegisterForm v-if="activeTab === 'register'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const activeTab = ref('login')
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background-mute);
  padding: var(--spacing-8) var(--spacing-4);
}

.auth-view__container {
  width: 100%;
  max-width: 520px;
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-view__tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.auth-view__tab-btn {
  flex: 1;
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--color-text);
  font-family: var(--font-family-base);
}

.auth-view__tab-btn--active {
  background-color: var(--color-background-soft);
  color: var(--color-highlight-1);
  border-bottom: 2px solid var(--color-highlight-1);
}

.auth-view__content {
  padding: var(--spacing-4);
}
</style>
