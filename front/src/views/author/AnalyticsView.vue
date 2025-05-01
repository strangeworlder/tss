<!--
AnalyticsView.vue
Component name: AnalyticsView
Description: View for author analytics and statistics
Features:
- Content performance metrics
- Engagement statistics
- Publishing insights
- Accessibility compliant
Usage:
<template>
  <AnalyticsView />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper semantic structure
- ARIA labels
- Screen reader support
-->

<template>
  <AuthorDashboardLayout title="Analytics">
    <div class="author-analytics">
      <AuthorStatistics :data="statisticsData" />
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthorStore } from '@/stores/author';
import { useBlogStore } from '@/stores/blogStore';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';
import AuthorStatistics from '@/components/molecules/author/AuthorStatistics.vue';
import type { IContentStatistics, IActivity } from '@/types/content';
import { BlogPostStatus } from '@/types/blog';
import type { IBlogPost } from '@/types/blog';

const route = useRoute();
const authorStore = useAuthorStore();
const blogStore = useBlogStore();

// State
const contentStats = ref({
  total: 0,
  published: 0,
  scheduled: 0,
  draft: 0,
});

const recentActivity = ref<IActivity[]>([]);

// Computed
const statisticsData = computed<IContentStatistics>(() => ({
  total: contentStats.value.total,
  published: contentStats.value.published,
  scheduled: contentStats.value.scheduled,
  draft: contentStats.value.draft,
  activity: recentActivity.value,
  metrics: [
    {
      label: 'Total Posts',
      value: contentStats.value.total,
      change: '+0%',
      trend: 'neutral',
    },
    {
      label: 'Published',
      value: contentStats.value.published,
      change: '+0%',
      trend: 'neutral',
    },
    {
      label: 'Scheduled',
      value: contentStats.value.scheduled,
      change: '+0%',
      trend: 'neutral',
    },
    {
      label: 'Drafts',
      value: contentStats.value.draft,
      change: '+0%',
      trend: 'neutral',
    },
  ],
  charts: [
    {
      type: 'bar',
      title: 'Content Distribution',
      data: {
        labels: ['Published', 'Scheduled', 'Drafts'],
        datasets: [
          {
            label: 'Posts',
            data: [
              contentStats.value.published,
              contentStats.value.scheduled,
              contentStats.value.draft,
            ],
            backgroundColor: ['var(--color-success)', 'var(--color-warning)', 'var(--color-info)'],
          },
        ],
      },
    },
  ],
  recentActivity: recentActivity.value,
}));

// Methods
const fetchAnalytics = async () => {
  try {
    // Fetch blog posts
    await blogStore.fetchPosts();

    // Calculate statistics
    const posts = blogStore.posts.filter(
      (post: IBlogPost) =>
        post.author &&
        ((post.author.id && post.author.id === authorStore.author?.id) ||
          (post.author.type === 'user' && post.author.id === authorStore.author?.id))
    );

    contentStats.value = {
      total: posts.length,
      published: posts.filter((post: IBlogPost) => post.status === BlogPostStatus.PUBLISHED).length,
      scheduled: posts.filter((post: IBlogPost) => post.status === BlogPostStatus.SCHEDULED).length,
      draft: posts.filter((post: IBlogPost) => post.status === BlogPostStatus.DRAFT).length,
    };

    // Generate recent activity
    recentActivity.value = posts.slice(0, 5).map((post: IBlogPost) => ({
      id: post.id,
      date: new Date(post.updatedAt),
      action:
        post.status === BlogPostStatus.PUBLISHED
          ? 'published'
          : post.status === BlogPostStatus.SCHEDULED
            ? 'scheduled'
            : 'updated',
      content: post.title,
      user: post.author?.name || 'Anonymous',
    }));
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};

// Lifecycle
onMounted(() => {
  fetchAnalytics();
});
</script>

<style scoped>
.author-analytics {
  padding: var(--spacing-md);
}
</style> 