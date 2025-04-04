<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'
import NotificationList from '@/components/common/NotificationList.vue'

const router = useRouter()
const authStore = useAuthStore()

const userFullName = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.firstName} ${authStore.user.lastName}`
})

const handleLogout = () => {
  authStore.clearAuthData()
  router.push('/')
}
</script>

<template>
  <div class="app">
    <NotificationList />
    <header class="app-header">
      <div class="container app-header__container">
        <h1 class="app-header__title">Vue Blog</h1>
        <nav class="app-header__nav">
          <ul class="app-header__nav-list">
            <li><RouterLink to="/" class="app-header__nav-link">Home</RouterLink></li>
            <li><RouterLink to="/blog" class="app-header__nav-link">Blog</RouterLink></li>
            <li><RouterLink to="/about" class="app-header__nav-link">About</RouterLink></li>
            <li v-if="authStore.isAdmin">
              <RouterLink to="/admin" class="app-header__nav-link">Admin</RouterLink>
            </li>
            <li v-if="!authStore.isAuthenticated">
              <RouterLink to="/auth" class="app-header__nav-link">Login / Register</RouterLink>
            </li>
            <li v-else class="app-header__user-menu">
              <RouterLink to="/profile" class="app-header__nav-link">
                <span class="app-header__user-name">{{ userFullName }}</span>
              </RouterLink>
              <button @click="handleLogout" class="app-header__logout-button">Logout</button>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="container app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <div class="container app-footer__container">
        <p>&copy; {{ new Date().getFullYear() }} Vue Blog. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
}

.app-header {
  background-color: var(--color-gray-800);
  color: var(--color-white);
  padding: var(--spacing-4);
  line-height: 1.5;
  max-height: 100vh;
}

.app-header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header__title {
  font-size: 1.5rem;
  font-weight: bold;
}

.app-header__nav-list {
  display: flex;
  align-items: center;
}

.app-header__nav-list li {
  margin-left: var(--spacing-4);
}

.app-header__nav-list li:first-child {
  margin-left: 0;
}

.app-header__nav-link {
  color: var(--color-white);
  text-decoration: none;
}

.app-header__nav-link:hover {
  color: var(--color-gray-300);
}

.app-header__user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.app-header__user-name {
  color: var(--color-white);
}

.app-header__logout-button {
  background: none;
  border: 1px solid var(--color-white);
  color: var(--color-white);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
}

.app-header__logout-button:hover {
  background-color: var(--color-white);
  color: var(--color-gray-800);
}

.app-main {
  padding-top: var(--spacing-8);
  padding-bottom: var(--spacing-8);
}

.app-footer {
  background-color: var(--color-gray-800);
  color: var(--color-white);
  padding: var(--spacing-4);
  margin-top: var(--spacing-8);
}

.app-footer__container {
  text-align: center;
}

@media (min-width: 1024px) {
  .app-header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .app-header__nav {
    text-align: left;
    font-size: 1rem;
    padding: 1rem 0;
  }
}
</style>
