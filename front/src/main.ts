import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from '@/types/pinia.d'

// Import stores
import { useNotificationStore } from './stores/notification'
import { useCounterStore } from './stores/counter'
import { useBlogStore } from './stores/blogStore'
import { useAuthStore } from './stores/authStore'
import { useUserStore } from './stores/userStore'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const blogStore = useBlogStore()
const userStore = useUserStore()
const counterStore = useCounterStore()

app.mount('#app')