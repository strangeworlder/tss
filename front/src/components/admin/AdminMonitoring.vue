<!--
AdminMonitoring.vue
Component name: AdminMonitoring
Description: Admin monitoring component for tracking system activity
Features:
- Real-time system metrics
- Error tracking and analytics
- Performance monitoring
- Accessibility compliant
Usage:
<template>
  <AdminMonitoring />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper table structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->
<template>
  <div class="admin-monitoring">
    <h2 class="admin-monitoring__title">System Monitoring</h2>
    
    <div class="admin-monitoring__grid">
      <section class="admin-monitoring__section">
        <h3 class="admin-monitoring__section-title">System Metrics</h3>
        <div class="admin-monitoring__metrics">
          <div class="admin-monitoring__metric">
            <span class="admin-monitoring__metric-label">Active Timers</span>
            <span class="admin-monitoring__metric-value">{{ metrics.activeTimers }}</span>
          </div>
          <div class="admin-monitoring__metric">
            <span class="admin-monitoring__metric-label">Total Processed</span>
            <span class="admin-monitoring__metric-value">{{ metrics.totalProcessed }}</span>
          </div>
          <div class="admin-monitoring__metric">
            <span class="admin-monitoring__metric-label">Error Rate</span>
            <span class="admin-monitoring__metric-value">{{ metrics.errorRate }}%</span>
          </div>
          <div class="admin-monitoring__metric">
            <span class="admin-monitoring__metric-label">Memory Usage</span>
            <span class="admin-monitoring__metric-value">{{ metrics.memoryUsage }}MB</span>
          </div>
        </div>
      </section>

      <section class="admin-monitoring__section">
        <h3 class="admin-monitoring__section-title">Recent Errors</h3>
        <div class="admin-monitoring__table-container">
          <table class="admin-monitoring__table" aria-label="Recent Errors">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="error in recentErrors" :key="error.id">
                <td>{{ formatTime(error.timestamp) }}</td>
                <td>{{ error.type }}</td>
                <td>{{ error.message }}</td>
                <td>
                  <span :class="['admin-monitoring__status', `admin-monitoring__status--${error.status}`]">
                    {{ error.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="admin-monitoring__section">
        <h3 class="admin-monitoring__section-title">Performance</h3>
        <div class="admin-monitoring__chart">
          <!-- TODO: Implement performance chart -->
          <div class="admin-monitoring__chart-placeholder">
            Performance chart will be displayed here
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

interface IMetric {
  activeTimers: number;
  totalProcessed: number;
  errorRate: number;
  memoryUsage: number;
}

interface IError {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  status: 'resolved' | 'pending' | 'failed';
}

const authStore = useAuthStore();
const metrics = ref<IMetric>({
  activeTimers: 0,
  totalProcessed: 0,
  errorRate: 0,
  memoryUsage: 0,
});

const recentErrors = ref<IError[]>([]);
let updateInterval: number | null = null;

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

const fetchMetrics = async () => {
  try {
    const response = await fetch('/api/admin/metrics', {
      headers: {
        Authorization: `Bearer ${authStore.state.token}`,
      },
    });
    const data = await response.json();
    metrics.value = data;
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
  }
};

const fetchRecentErrors = async () => {
  try {
    const response = await fetch('/api/admin/errors', {
      headers: {
        Authorization: `Bearer ${authStore.state.token}`,
      },
    });
    const data = await response.json();
    recentErrors.value = data;
  } catch (error) {
    console.error('Failed to fetch errors:', error);
  }
};

onMounted(() => {
  fetchMetrics();
  fetchRecentErrors();
  updateInterval = window.setInterval(() => {
    fetchMetrics();
    fetchRecentErrors();
  }, 5000);
});

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped>
.admin-monitoring {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.admin-monitoring__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.admin-monitoring__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.admin-monitoring__section {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.admin-monitoring__section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.admin-monitoring__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.admin-monitoring__metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
}

.admin-monitoring__metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.admin-monitoring__metric-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.admin-monitoring__table-container {
  overflow-x: auto;
}

.admin-monitoring__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.admin-monitoring__table th,
.admin-monitoring__table td {
  padding: var(--spacing-sm);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.admin-monitoring__table th {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.admin-monitoring__status {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.admin-monitoring__status--resolved {
  background-color: var(--color-success);
  color: var(--color-text-inverse);
}

.admin-monitoring__status--pending {
  background-color: var(--color-warning);
  color: var(--color-text-inverse);
}

.admin-monitoring__status--failed {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.admin-monitoring__chart {
  height: 300px;
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-monitoring__chart-placeholder {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style> 