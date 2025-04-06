<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { computed, ref, onMounted } from 'vue'
import NotificationList from '@/components/molecules/NotificationList.vue'
import MenuToggle from '@/components/atoms/MenuToggle.vue'
import Navigation from '@/components/organisms/Navigation.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const userFullName = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.firstName} ${authStore.user.lastName}`
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth')
}

// Close menus when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.navigation') && !target.closest('.menu-toggle')) {
      isMenuOpen.value = false
    }
    if (!target.closest('.user-menu')) {
      isUserMenuOpen.value = false
    }
  })
})
</script>

<template>
  <div class="app">
    <NotificationList />
    <header class="app-header">
      <div class="container app-header__container">
        <RouterLink to="/" class="app-header__logo">
          <h1 class="app-header__title">Vue Blog</h1>
        </RouterLink>

        <MenuToggle :is-open="isMenuOpen" @toggle="isMenuOpen = !isMenuOpen" />

        <Navigation
          :is-open="isMenuOpen"
          :is-authenticated="authStore.isAuthenticated"
          :is-admin="authStore.isAdmin"
          :user-name="userFullName"
          :is-user-menu-open="isUserMenuOpen"
          @toggle-user-menu="isUserMenuOpen = !isUserMenuOpen"
          @logout="handleLogout"
        />
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
  background-color: var(--color-background);
  color: var(--color-text);
}

.app-header {
  background-color: var(--color-gray-800);
  color: var(--color-white);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.app-header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 var(--spacing-4);
}

.app-header__logo {
  text-decoration: none;
  color: var(--color-white);
}

.app-header__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-white);
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

.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}
</style>
