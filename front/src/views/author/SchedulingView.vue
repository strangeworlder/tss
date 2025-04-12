<!--
SchedulingView.vue
Component name: SchedulingView
Description: View for managing content scheduling
Features:
- Scheduling calendar
- Content scheduling
- Schedule management
- Accessibility compliant
Usage:
<template>
  <SchedulingView />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper calendar structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->

<template>
  <AuthorDashboardLayout title="Content Scheduling">
    <div class="author-scheduling">
      <div class="author-scheduling__content">
        <div class="author-scheduling__calendar">
          <SchedulingCalendar
            :schedules="schedules"
            @schedule="handleSchedule"
            @unschedule="handleUnschedule"
            @suggest-schedule="handleSuggestSchedule"
          />
        </div>

        <div v-if="selectedSchedule" class="author-scheduling__details">
          <h2 class="author-scheduling__details-title">Scheduled Content</h2>
          <div class="author-scheduling__content-details">
            <h3>{{ selectedSchedule.title }}</h3>
            <div class="author-scheduling__content-meta">
              <span>Scheduled for: {{ formatDateTime(selectedSchedule.startTime) }}</span>
              <span>Status: {{ selectedSchedule.status }}</span>
            </div>
            <div v-if="selectedSchedule.hasConflict" class="author-scheduling__conflicts">
              <div class="author-scheduling__conflicts-warning">⚠️</div>
              <div class="author-scheduling__conflicts-message">
                Conflicts with:
                <ul class="author-scheduling__conflicts-list">
                  <li
                    v-for="conflict in selectedSchedule.conflictingSchedules"
                    :key="conflict.id"
                    class="author-scheduling__conflicts-item"
                  >
                    {{ conflict.title }} ({{ formatTime(conflict.startTime) }})
                  </li>
                </ul>
              </div>
            </div>
            <div class="author-scheduling__content-actions">
              <button
                @click="handleEditSchedule"
                class="author-scheduling__button author-scheduling__button--secondary"
              >
                Edit
              </button>
              <button
                @click="() => handleUnschedule(selectedSchedule?.id || '')"
                class="author-scheduling__button author-scheduling__button--danger"
              >
                Unschedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';
import SchedulingCalendar from '@/components/organisms/calendar/SchedulingCalendar.vue';
import { useAuthorStore } from '@/stores/author';
import type { ISchedule } from '@/types/scheduling';

const authStore = useAuthorStore();

// Emits
const emit = defineEmits<{
  (e: 'schedule', schedule: ISchedule): void;
  (e: 'unschedule', scheduleId: string): void;
  (e: 'suggest-schedule', suggestedTime: Date): void;
}>();

// State
const schedules = ref<ISchedule[]>([]);
const selectedSchedule = ref<ISchedule | null>(null);

// Methods
const handleSchedule = (schedule: ISchedule) => {
  // TODO: Implement scheduling
  console.log('Scheduling content:', schedule);
  emit('schedule', schedule);
};

const handleUnschedule = (scheduleId: string) => {
  if (!selectedSchedule.value) return;
  // TODO: Implement unscheduling
  console.log('Unscheduling content:', scheduleId);
  emit('unschedule', scheduleId);
};

const handleSuggestSchedule = (suggestedTime: Date) => {
  // TODO: Implement suggestion handling
  console.log('Suggested time:', suggestedTime);
  emit('suggest-schedule', suggestedTime);
};

const handleEditSchedule = () => {
  if (!selectedSchedule.value) return;
  // TODO: Implement schedule editing
  console.log('Editing schedule:', selectedSchedule.value);
};

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
  }).format(date);
};

// Fetch scheduled content
const fetchScheduledContent = async () => {
  try {
    // TODO: Implement API call to fetch scheduled content
    schedules.value = [];
  } catch (error) {
    console.error('Error fetching scheduled content:', error);
  }
};

// Initialize
fetchScheduledContent();
</script>

<style scoped>
.author-scheduling {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.author-scheduling__content {
  display: display;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-lg);
  height: 100%;
}

@media (min-width: 768px) {
  .author-scheduling__content {
    grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
  }
}

.author-scheduling__calendar {
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.author-scheduling__details {
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  height: fit-content;
  position: sticky;
  top: 0;
}

.author-scheduling__details-title {
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family-serif);
  font-size: var(--font-size-lg);
  color: var(--color-text);
}

.author-scheduling__content-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.author-scheduling__content-details h3 {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin: 0;
}

.author-scheduling__content-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.author-scheduling__conflicts {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-warning-light);
  border-radius: var(--border-radius-sm);
  margin: var(--spacing-sm) 0;
}

.author-scheduling__conflicts-warning {
  color: var(--color-warning);
  font-size: var(--font-size-lg);
}

.author-scheduling__conflicts-message {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.author-scheduling__conflicts-list {
  margin: var(--spacing-xs) 0 0 var(--spacing-md);
  padding-left: var(--spacing-md);
  list-style-type: none;
}

.author-scheduling__conflicts-item {
  margin-bottom: var(--spacing-xs);
  position: relative;
}

.author-scheduling__conflicts-item::before {
  content: "•";
  position: absolute;
  left: -1rem;
  color: var(--color-warning);
}

.author-scheduling__content-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.author-scheduling__button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: bold;
  font-family: var(--font-family-sans);
  transition: all 0.2s ease;
}

.author-scheduling__button--secondary {
  background-color: var(--color-background-alt);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.author-scheduling__button--secondary:hover {
  background-color: var(--color-background-hover);
}

.author-scheduling__button--danger {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.author-scheduling__button--danger:hover {
  background-color: var(--color-danger-dark);
}
</style> 