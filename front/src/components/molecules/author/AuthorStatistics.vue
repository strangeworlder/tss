<!--
AuthorStatistics.vue
Component name: AuthorStatistics
Description: Author-specific statistics component for content analytics
Features:
- Extends generic ContentStatistics component
- Author-specific metrics
- Content performance analysis
- Publishing insights
- Accessibility compliant
Usage:
<template>
  <AuthorStatistics :data="authorStatisticsData" />
</template>
Props:
- data: IContentStatistics - Content statistics data
Accessibility:
- Inherits accessibility features from ContentStatistics
-->

<template>
  <div class="author-statistics">
    <ContentStatistics :data="contentStats" />
    
    <div class="author-statistics__author-metrics">
      <h3 class="author-statistics__section-title">Author Performance</h3>
      
      <div class="author-statistics__metrics-grid">
        <div v-for="metric in data.metrics" :key="metric.label" class="author-statistics__metric">
          <div class="author-statistics__metric-value">{{ metric.value }}</div>
          <div class="author-statistics__metric-label">{{ metric.label }}</div>
          <div class="author-statistics__metric-change" :class="`trend-${metric.trend}`">
            {{ metric.change }}
          </div>
        </div>
      </div>
      
      <div class="author-statistics__insights">
        <h4 class="author-statistics__insights-title">Recent Activity</h4>
        <ul class="author-statistics__insights-list">
          <li v-for="activity in data.recentActivity" :key="activity.id" class="author-statistics__insight-item">
            {{ activity.action }} - {{ activity.content }} ({{ activity.user }})
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IContentStatistics } from '@/types/content';
import ContentStatistics from '@/components/molecules/statistics/ContentStatistics.vue';

// Props
const props = defineProps<{
  data: IContentStatistics;
}>();

// Computed
const contentStats = computed<IContentStatistics>(() => ({
  total: props.data.total,
  published: props.data.published,
  scheduled: props.data.scheduled,
  draft: props.data.draft,
  activity: props.data.activity,
  metrics: props.data.metrics,
  charts: props.data.charts,
  recentActivity: props.data.recentActivity,
}));
</script>

<style scoped>
.author-statistics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.author-statistics__author-metrics {
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
}

.author-statistics__section-title {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.author-statistics__metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.author-statistics__metric {
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
  text-align: center;
}

.author-statistics__metric-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
  color: var(--color-primary-600);
}

.author-statistics__metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.author-statistics__metric-change {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.author-statistics__metric-change.trend-up {
  color: var(--color-success);
}

.author-statistics__metric-change.trend-down {
  color: var(--color-danger);
}

.author-statistics__metric-change.trend-neutral {
  color: var(--color-text-muted);
}

.author-statistics__insights {
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
}

.author-statistics__insights-title {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.author-statistics__insights-list {
  margin: 0;
  padding-left: var(--spacing-md);
}

.author-statistics__insight-item {
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.author-statistics__insight-item:last-child {
  margin-bottom: 0;
}
</style>
