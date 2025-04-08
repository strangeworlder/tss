// Theme imports
import './assets/themes/steampunk/light.css';
import './assets/themes/steampunk/dark.css';
import './assets/themes/horror/light.css';
import './assets/themes/horror/dark.css';

import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from '@/types/pinia.d';

// Import stores
import { useNotificationStore } from './stores/notification';
import { useCounterStore } from './stores/counter';
import { useBlogStore } from './stores/blogStore';
import { useAuthStore } from './stores/authStore';
import { useUserStore } from './stores/userStore';
import { useThemeStore } from './stores/themeStore';

import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize stores
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const blogStore = useBlogStore();
const userStore = useUserStore();
const counterStore = useCounterStore();
const themeStore = useThemeStore();

// Initialize theme
themeStore.initializeTheme();

app.mount('#app');
