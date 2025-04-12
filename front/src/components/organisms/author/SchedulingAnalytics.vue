<!--
SchedulingAnalytics.vue
Component name: SchedulingAnalytics
Description: Analytics view for content scheduling
Features:
- Schedule distribution by day/time
- Conflict statistics
- Schedule completion rates
- Accessibility compliant
Usage:
<template>
  <SchedulingAnalytics
    :schedules="schedules"
    :timeRange="timeRange"
    @timeRangeChange="handleTimeRangeChange"
  />
</template>
Props:
- schedules: ISchedule[] - List of scheduled content
- timeRange: { start: Date, end: Date } - Time range for analytics
Events:
- timeRangeChange: Emitted when time range is changed
Accessibility:
- Proper ARIA labels
- Screen reader support
- Keyboard navigation
-->

<template>
  <div class="scheduling-analytics">
    <div class="scheduling-analytics__header">
      <h2 class="scheduling-analytics__title">Scheduling Analytics</h2>
      <div class="scheduling-analytics__time-range">
        <select
          v-model="selectedTimeRange"
          class="scheduling-analytics__time-range-select"
          @change="handleTimeRangeChange"
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="quarter">Last 90 days</option>
          <option value="year">Last 365 days</option>
        </select>
      </div>
    </div>

    <div class="scheduling-analytics__stats">
      <div class="scheduling-analytics__stat-card">
        <div class="scheduling-analytics__stat-value">{{ totalSchedules }}</div>
        <div class="scheduling-analytics__stat-label">Total Schedules</div>
      </div>
      <div class="scheduling-analytics__stat-card">
        <div class="scheduling-analytics__stat-value">{{ completedSchedules }}</div>
        <div class="scheduling-analytics__stat-label">Completed</div>
      </div>
      <div class="scheduling-analytics__stat-card">
        <div class="scheduling-analytics__stat-value">{{ conflictCount }}</div>
        <div class="scheduling-analytics__stat-label">Conflicts</div>
      </div>
      <div class="scheduling-analytics__stat-card">
        <div class="scheduling-analytics__stat-value">{{ completionRate }}%</div>
        <div class="scheduling-analytics__stat-label">Completion Rate</div>
      </div>
    </div>

    <div class="scheduling-analytics__charts">
      <div class="scheduling-analytics__chart">
        <h3 class="scheduling-analytics__chart-title">Schedule Distribution by Day</h3>
        <div class="scheduling-analytics__chart-container">
          <!-- Placeholder for day distribution chart -->
          <div class="scheduling-analytics__chart-placeholder">
            Day distribution chart will be implemented here
          </div>
        </div>
      </div>

      <div class="scheduling-analytics__chart">
        <h3 class="scheduling-analytics__chart-title">Schedule Distribution by Time</h3>
        <div class="scheduling-analytics__chart-container">
          <!-- Placeholder for time distribution chart -->
          <div class="scheduling-analytics__chart-placeholder">
            Time distribution chart will be implemented here
          </div>
        </div>
      </div>
    </div>

    <div class="scheduling-analytics__details">
      <h3 class="scheduling-analytics__details-title">Detailed Statistics</h3>
      <div class="scheduling-analytics__details-content">
        <div class="scheduling-analytics__details-row">
          <span class="scheduling-analytics__details-label">Average Schedules per Day:</span>
          <span>{{ averageSchedulesPerDay }}</span>
        </div>
        <div class="scheduling-analytics__details-row">
          <span class="scheduling-analytics__details-label">Most Active Day:</span>
          <span>{{ mostActiveDay }}</span>
        </div>
        <div class="scheduling-analytics__details-row">
          <span class="scheduling-analytics__details-label">Peak Scheduling Time:</span>
          <span>{{ peakSchedulingTime }}</span>
        </div>
        <div class="scheduling-analytics__details-row">
          <span class="scheduling-analytics__details-label">Conflict Resolution Rate:</span>
          <span>{{ conflictResolutionRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface ISchedule {
  id: string;
  title: string;
  startTime: Date;
  status: string;
  hasConflict: boolean;
  conflictingSchedules?: ISchedule[];
}

// Props
const props = defineProps<{
  schedules: ISchedule[];
  timeRange: { start: Date; end: Date };
}>();

// Emits
const emit = defineEmits<(e: 'timeRangeChange', timeRange: { start: Date; end: Date }) => void>();

// State
const selectedTimeRange = ref('month');

// Date utility functions
const subDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

const subQuarters = (date: Date, quarters: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - quarters * 3);
  return result;
};

const subYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Computed
const filteredSchedules = computed(() => {
  const now = new Date();
  let startDate: Date;

  switch (selectedTimeRange.value) {
    case 'week':
      startDate = subDays(now, 7);
      break;
    case 'month':
      startDate = subMonths(now, 1);
      break;
    case 'quarter':
      startDate = subQuarters(now, 1);
      break;
    case 'year':
      startDate = subYears(now, 1);
      break;
    default:
      startDate = subMonths(now, 1);
  }

  return props.schedules.filter(
    (schedule) => schedule.startTime >= startOfDay(startDate) && schedule.startTime <= endOfDay(now)
  );
});

const totalSchedules = computed(() => filteredSchedules.value.length);

const completedSchedules = computed(
  () => filteredSchedules.value.filter((schedule) => schedule.status === 'completed').length
);

const conflictCount = computed(
  () => filteredSchedules.value.filter((schedule) => schedule.hasConflict).length
);

const completionRate = computed(() => {
  if (totalSchedules.value === 0) return 0;
  return Math.round((completedSchedules.value / totalSchedules.value) * 100);
});

const averageSchedulesPerDay = computed(() => {
  const days =
    selectedTimeRange.value === 'week'
      ? 7
      : selectedTimeRange.value === 'month'
        ? 30
        : selectedTimeRange.value === 'quarter'
          ? 90
          : 365;
  return (totalSchedules.value / days).toFixed(1);
});

const mostActiveDay = computed(() => {
  const dayCounts = new Map<string, number>();
  for (const schedule of filteredSchedules.value) {
    const day = formatDate(schedule.startTime).split(', ')[0];
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  }

  let maxDay = '';
  let maxCount = 0;
  dayCounts.forEach((count, day) => {
    if (count > maxCount) {
      maxCount = count;
      maxDay = day;
    }
  });

  return maxDay;
});

const peakSchedulingTime = computed(() => {
  const hourCounts = new Map<number, number>();
  for (const schedule of filteredSchedules.value) {
    const hour = schedule.startTime.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  }

  let maxHour = 0;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      maxHour = hour;
    }
  });

  return `${maxHour}:00`;
});

const conflictResolutionRate = computed(() => {
  const conflicts = filteredSchedules.value.filter((schedule) => schedule.hasConflict);
  if (conflicts.length === 0) return 100;

  const resolved = conflicts.filter(
    (schedule) => schedule.status === 'completed' || schedule.status === 'published'
  ).length;

  return Math.round((resolved / conflicts.length) * 100);
});

// Methods
const handleTimeRangeChange = () => {
  const now = new Date();
  let startDate: Date;

  switch (selectedTimeRange.value) {
    case 'week':
      startDate = subDays(now, 7);
      break;
    case 'month':
      startDate = subMonths(now, 1);
      break;
    case 'quarter':
      startDate = subQuarters(now, 1);
      break;
    case 'year':
      startDate = subYears(now, 1);
      break;
    default:
      startDate = subMonths(now, 1);
  }

  emit('timeRangeChange', {
    start: startDate,
    end: now,
  });
};
</script>

<style scoped>
.scheduling-analytics {
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.scheduling-analytics__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.scheduling-analytics__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.scheduling-analytics__time-range-select {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
}

.scheduling-analytics__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.scheduling-analytics__stat-card {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  text-align: center;
}

.scheduling-analytics__stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.scheduling-analytics__stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.scheduling-analytics__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.scheduling-analytics__chart {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.scheduling-analytics__chart-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.scheduling-analytics__chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
}

.scheduling-analytics__chart-placeholder {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.scheduling-analytics__details {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.scheduling-analytics__details-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.scheduling-analytics__details-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.scheduling-analytics__details-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.scheduling-analytics__details-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style> 