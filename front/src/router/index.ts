import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home' },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'About Us' },
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogView.vue'),
      meta: { title: 'Blog' },
    },
    {
      path: '/blog/:slug',
      name: 'blog-detail',
      component: () => import('../views/BlogDetailView.vue'),
      meta: { title: 'Blog Post' },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      meta: { title: 'Sign In' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin Dashboard' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true, title: 'Your Profile' },
    },
    {
      path: '/author',
      name: 'author',
      component: () => import('../views/AuthorView.vue'),
      meta: { requiresAuth: true, requiresAuthor: true, title: 'Author Dashboard' },
      children: [
        {
          path: '',
          name: 'author-dashboard',
          component: () => import('../views/author/DashboardView.vue'),
        },
        {
          path: 'content',
          name: 'author-content',
          component: () => import('../views/author/ContentManagementView.vue'),
        },
        {
          path: 'content/drafts',
          name: 'author-content-drafts',
          component: () => import('../views/author/DraftsView.vue'),
          meta: { title: 'Draft Content' },
        },
        {
          path: 'content/new',
          name: 'author-content-new',
          component: () => import('../views/author/ContentCreatorView.vue'),
          meta: { title: 'Create Content' },
        },
        {
          path: 'schedule',
          name: 'author-schedule',
          component: () => import('../views/author/SchedulingView.vue'),
          meta: { title: 'Content Scheduling' },
        },
        {
          path: 'analytics',
          name: 'author-analytics',
          component: () => import('../views/author/AnalyticsView.vue'),
          meta: { title: 'Analytics' },
        },
        {
          path: 'comments',
          name: 'author-comments',
          component: () => import('../views/author/CommentsView.vue'),
          meta: { title: 'Comments' },
        },
        {
          path: 'settings',
          name: 'author-settings',
          component: () => import('../views/author/SettingsView.vue'),
        },
      ],
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Check if route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      next({
        path: '/auth',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // Check if route requires admin role
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      // Check if user is admin
      if (!authStore.isAdmin) {
        next({ path: '/' });
        return;
      }
    }

    // Check if route requires author role
    if (to.matched.some((record) => record.meta.requiresAuthor)) {
      // Check if user is author
      if (!authStore.isAuthor) {
        next({ path: '/' });
        return;
      }
    }
  }

  next();
});

// Set page title based on route meta
router.afterEach((to) => {
  // Get the page title from the route meta
  const title = (to.meta.title as string) || 'Page Not Found';

  // Set document title
  document.title = title ? `${title} | The Slow` : 'The Slow - A Thoughtful Blog';
});

export default router;
