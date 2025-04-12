<!--
Component: AuthorContentStatistics
Description: Author-specific extension of the ContentStatistics component
Features:
- Extends base ContentStatistics component
- Adds author-specific metrics (total posts, drafts, scheduled)
- Customizes charts and activity tables for author context
- Maintains accessibility features

Usage:
<AuthorContentStatistics
  :total-posts="100"
  :drafts="5"
  :scheduled="10"
  :engagement-rate="0.05"
  :charts="charts"
  :recent-activity="activity"
  @period-change="handlePeriodChange"
/>
-->

<template>
  <ContentStatistics
    :data="{
      metrics: authorMetrics,
      charts: authorCharts,
      recentActivity: authorActivity
    }"
    @period-change="handlePeriodChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IContentMetric, IContentChart, IContentActivity } from '@/types/content';
import ContentStatistics from '@/components/organisms/content/ContentStatistics.vue';

const props = defineProps<{
  totalPosts: number;
  drafts: number;
  scheduled: number;
  engagementRate: number;
  charts: IContentChart[];
  recentActivity: IContentActivity[];
}>();

const authorMetrics = computed<IContentMetric[]>(() => [
  {
    label: 'Total Posts',
    value: props.totalPosts,
    change: '+12%',
    trend: 'up',
  },
  {
    label: 'Drafts',
    value: props.drafts,
    change: '-2',
    trend: 'down',
  },
  {
    label: 'Scheduled',
    value: props.scheduled,
    change: '+5',
    trend: 'up',
  },
  {
    label: 'Engagement Rate',
    value: `${(props.engagementRate * 100).toFixed(1)}%`,
    change: '+0.5%',
    trend: 'up',
  },
]);

const authorCharts = computed<IContentChart[]>(() => props.charts);

const authorActivity = computed<IContentActivity[]>(() => props.recentActivity);

const handlePeriodChange = (period: string) => {
  console.log('Period changed in author context:', period);
};
</script>

<style scoped>
/* No additional styles needed as we're using the base component's styles */
</style> 