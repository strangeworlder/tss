<!--
ContentStatistics.vue
Component name: ContentStatistics
Description: Reusable content statistics component with metrics and charts
Features:
- Content metrics and analytics
- Visual charts and graphs
- Time period selection
- Accessibility compliant
Usage:
<template>
  <ContentStatistics :data="statisticsData" />
</template>
Props:
- data: IContentStatistics - Content statistics data
Accessibility:
- Proper ARIA labels
- Screen reader support
- Keyboard navigation
-->

<template>
  <div class="content-statistics">
    <div class="content-statistics__header">
      <h2 class="content-statistics__title">Content Statistics</h2>
      <div class="content-statistics__period">
        <label for="period" class="content-statistics__period-label">Time Period</label>
        <select
          id="period"
          v-model="selectedPeriod"
          class="content-statistics__period-select"
          aria-label="Select time period"
        >
          <option v-for="period in periods" :key="period.value" :value="period.value">
            {{ period.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="content-statistics__metrics">
      <div class="content-statistics__metric">
        <div class="content-statistics__metric-value">{{ totalContent }}</div>
        <div class="content-statistics__metric-label">Total Content</div>
      </div>
      <div class="content-statistics__metric">
        <div class="content-statistics__metric-value">{{ publishedContent }}</div>
        <div class="content-statistics__metric-label">Published</div>
      </div>
      <div class="content-statistics__metric">
        <div class="content-statistics__metric-value">{{ scheduledContent }}</div>
        <div class="content-statistics__metric-label">Scheduled</div>
      </div>
      <div class="content-statistics__metric">
        <div class="content-statistics__metric-value">{{ draftContent }}</div>
        <div class="content-statistics__metric-label">Drafts</div>
      </div>
    </div>

    <div class="content-statistics__charts">
      <div class="content-statistics__chart">
        <h3 class="content-statistics__chart-title">Content by Status</h3>
        <div class="content-statistics__chart-container">
          <!-- TODO: Add chart component -->
          <div class="content-statistics__chart-placeholder">
            Status Distribution Chart
          </div>
        </div>
      </div>

      <div class="content-statistics__chart">
        <h3 class="content-statistics__chart-title">Content by Type</h3>
        <div class="content-statistics__chart-container">
          <!-- TODO: Add chart component -->
          <div class="content-statistics__chart-placeholder">
            Type Distribution Chart
          </div>
        </div>
      </div>
    </div>

    <div class="content-statistics__table">
      <h3 class="content-statistics__table-title">Recent Activity</h3>
      <table class="content-statistics__activity-table">
        <thead>
          <tr>
            <th class="content-statistics__table-header">Date</th>
            <th class="content-statistics__table-header">Action</th>
            <th class="content-statistics__table-header">Content</th>
            <th class="content-statistics__table-header">User</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="activity in recentActivity"
            :key="activity.id"
            class="content-statistics__table-row"
          >
            <td class="content-statistics__table-cell">
              {{ formatDate(activity.date) }}
            </td>
            <td class="content-statistics__table-cell">{{ activity.action }}</td>
            <td class="content-statistics__table-cell">{{ activity.content }}</td>
            <td class="content-statistics__table-cell">{{ activity.user }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatDateTime } from '@/utils/date';

interface IActivity {
  id: string;
  date: Date;
  action: string;
  content: string;
  user: string;
}

interface IContentStatistics {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
  activity: IActivity[];
}

// Props
const props = defineProps<{
  data: IContentStatistics;
}>();

// State
const selectedPeriod = ref('week');

// Constants
const periods = [
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last Year' },
];

// Computed
const totalContent = computed(() => props.data.total);
const publishedContent = computed(() => props.data.published);
const scheduledContent = computed(() => props.data.scheduled);
const draftContent = computed(() => props.data.draft);
const recentActivity = computed(() => props.data.activity);

// Methods
const formatDate = (date: Date) => {
  return formatDateTime(date);
};
</script>

<style scoped>
.content-statistics {
  padding: var(--spacing-md);
}

.content-statistics__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.content-statistics__title {
  margin: 0;
}

.content-statistics__period {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.content-statistics__period-label {
  font-size: var(--font-size-sm);
  font-weight: bold;
}

.content-statistics__period-select {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}

.content-statistics__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.content-statistics__metric {
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  text-align: center;
}

.content-statistics__metric-value {
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.content-statistics__metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.content-statistics__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.content-statistics__chart {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.content-statistics__chart-title {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-md);
}

.content-statistics__chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius-sm);
}

.content-statistics__chart-placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}

.content-statistics__table {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.content-statistics__table-title {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-md);
}

.content-statistics__activity-table {
  width: 100%;
  border-collapse: collapse;
}

.content-statistics__table-header {
  text-align: left;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  font-weight: bold;
}

.content-statistics__table-row:nth-child(even) {
  background-color: var(--color-background);
}

.content-statistics__table-cell {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}
</style> 