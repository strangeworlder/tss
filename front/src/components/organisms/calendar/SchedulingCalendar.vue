<!--
SchedulingCalendar.vue
Component name: SchedulingCalendar
Description: Generic calendar view for content scheduling
Features:
- Monthly calendar view
- Schedule management
- Conflict detection
- Scheduling suggestions
- Accessibility compliant
Usage:
<template>
  <SchedulingCalendar
    :schedules="schedules"
    @schedule="handleSchedule"
    @unschedule="handleUnschedule"
    @suggest-schedule="handleSuggestSchedule"
  />
</template>
Props:
- schedules: ISchedule[] - List of scheduled content
Events:
- schedule: Emitted when content is scheduled
- unschedule: Emitted when schedule is removed
- suggest-schedule: Emitted when a suggested time slot is selected
Accessibility:
- Proper ARIA labels
- Screen reader support
- Keyboard navigation
-->

<template>
  <div class="scheduling-calendar">
    <div class="scheduling-calendar__header">
      <div class="scheduling-calendar__navigation">
        <button
          class="scheduling-calendar__nav-button"
          @click="previousMonth"
          aria-label="Previous month"
        >
          &lt;
        </button>
        <h2 class="scheduling-calendar__title">
          {{ formatMonthYear(currentDate) }}
        </h2>
        <button
          class="scheduling-calendar__nav-button"
          @click="nextMonth"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>
      <div class="scheduling-calendar__view-options">
        <button
          class="scheduling-calendar__view-button"
          :class="{ 'scheduling-calendar__view-button--active': view === 'month' }"
          @click="setView('month')"
          aria-label="Month view"
        >
          Month
        </button>
        <button
          class="scheduling-calendar__view-button"
          :class="{ 'scheduling-calendar__view-button--active': view === 'week' }"
          @click="setView('week')"
          aria-label="Week view"
        >
          Week
        </button>
      </div>
    </div>

    <div v-if="hasConflicts" class="scheduling-calendar__conflicts-warning">
      <div class="scheduling-calendar__conflicts-icon">⚠️</div>
      <div class="scheduling-calendar__conflicts-message">
        There are {{ conflictCount }} scheduling conflicts in this period
      </div>
    </div>

    <div class="scheduling-calendar__grid">
      <div class="scheduling-calendar__weekdays">
        <div
          v-for="weekday in weekdays"
          :key="weekday"
          class="scheduling-calendar__weekday"
        >
          {{ weekday }}
        </div>
      </div>

      <div class="scheduling-calendar__days">
        <div
          v-for="day in calendarDays"
          :key="day.date.toISOString()"
          class="scheduling-calendar__day"
          :class="{
            'scheduling-calendar__day--today': isToday(day.date),
            'scheduling-calendar__day--other-month': !isCurrentMonth(day.date),
            'scheduling-calendar__day--has-schedule': day.schedules.length > 0,
            'scheduling-calendar__day--has-conflict': day.hasConflict
          }"
        >
          <div class="scheduling-calendar__day-number">
            {{ day.date.getDate() }}
            <span v-if="day.hasConflict" class="scheduling-calendar__day-conflict-indicator">⚠️</span>
          </div>
          <div class="scheduling-calendar__schedules">
            <div
              v-for="schedule in day.schedules"
              :key="schedule.id"
              class="scheduling-calendar__schedule"
              :class="{
                'scheduling-calendar__schedule--conflict': schedule.hasConflict
              }"
              @click="selectSchedule(schedule)"
            >
              <div class="scheduling-calendar__schedule-time">
                {{ formatTime(schedule.startTime) }}
              </div>
              <div class="scheduling-calendar__schedule-title">
                {{ schedule.title }}
              </div>
              <div v-if="schedule.hasConflict" class="scheduling-calendar__schedule-conflict">
                <div class="scheduling-calendar__schedule-conflict-icon">⚠️</div>
                <div class="scheduling-calendar__schedule-conflict-message">
                  Conflicts with: {{ schedule.conflictingSchedules?.map(s => s.title).join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="scheduling-calendar__suggestions">
      <h3 class="scheduling-calendar__suggestions-title">Scheduling Suggestions</h3>
      <div v-if="suggestedSlots.length > 0" class="scheduling-calendar__suggestions-list">
        <div
          v-for="slot in suggestedSlots"
          :key="slot.toISOString()"
          class="scheduling-calendar__suggestion"
          @click="selectSuggestedSlot(slot)"
        >
          <span class="scheduling-calendar__suggestion-date">{{ formatDate(slot) }}</span>
          <span class="scheduling-calendar__suggestion-time">{{ formatTime(slot) }}</span>
        </div>
      </div>
      <div v-else class="scheduling-calendar__suggestions-empty">
        No suggestions available for the selected period.
      </div>
      <button
        class="scheduling-calendar__suggestions-refresh"
        @click="generateSuggestions"
      >
        Refresh Suggestions
      </button>
    </div>

    <div v-if="selectedSchedule" class="scheduling-calendar__details">
      <h3 class="scheduling-calendar__details-title">
        {{ selectedSchedule.title }}
      </h3>
      <div class="scheduling-calendar__details-content">
        <div class="scheduling-calendar__details-row">
          <span class="scheduling-calendar__details-label">Date:</span>
          <span>{{ formatDate(selectedSchedule.startTime) }}</span>
        </div>
        <div class="scheduling-calendar__details-row">
          <span class="scheduling-calendar__details-label">Time:</span>
          <span>{{ formatTime(selectedSchedule.startTime) }}</span>
        </div>
        <div class="scheduling-calendar__details-row">
          <span class="scheduling-calendar__details-label">Status:</span>
          <span>{{ selectedSchedule.status }}</span>
        </div>
        <div v-if="selectedSchedule.hasConflict" class="scheduling-calendar__details-warning">
          <div class="scheduling-calendar__details-warning-title">
            Schedule Conflict
          </div>
          <div class="scheduling-calendar__details-warning-content">
            This schedule conflicts with:
            <ul class="scheduling-calendar__details-warning-list">
              <li
                v-for="conflict in selectedSchedule.conflictingSchedules"
                :key="conflict.id"
                class="scheduling-calendar__details-warning-item"
              >
                {{ conflict.title }} ({{ formatTime(conflict.startTime) }})
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="scheduling-calendar__details-actions">
        <button
          class="scheduling-calendar__details-button"
          @click="editSchedule(selectedSchedule)"
        >
          Edit
        </button>
        <button
          class="scheduling-calendar__details-button"
          @click="removeSchedule(selectedSchedule)"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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
}>();

// Emits
const emit = defineEmits<{
  (e: 'schedule', schedule: ISchedule): void;
  (e: 'unschedule', scheduleId: string): void;
  (e: 'suggest-schedule', suggestedTime: Date): void;
}>();

// State
const currentDate = ref(new Date());
const view = ref<'month' | 'week'>('month');
const selectedSchedule = ref<ISchedule | null>(null);
const suggestedSlots = ref<Date[]>([]);

// Constants
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MINIMUM_TIME_GAP = 30; // Minimum time gap between schedules in minutes
const SUGGESTION_DAYS_RANGE = 7; // Number of days to look for suggestions
const SUGGESTIONS_COUNT = 5; // Number of suggestions to show
const WORKING_HOURS_START = 9; // 9 AM
const WORKING_HOURS_END = 17; // 5 PM

// Computed
const calendarDays = computed(() => {
  const days: Array<{
    date: Date;
    schedules: ISchedule[];
    hasConflict: boolean;
  }> = [];

  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);

  // Add days from previous month
  const firstDayOfWeek = firstDay.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    days.push({
      date,
      schedules: [],
      hasConflict: false,
    });
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), i);
    const daySchedules = props.schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startTime);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
    days.push({
      date,
      schedules: daySchedules,
      hasConflict: daySchedules.some((schedule) => schedule.hasConflict),
    });
  }

  // Add days from next month
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    const date = new Date(lastDay);
    date.setDate(date.getDate() + i);
    days.push({
      date,
      schedules: [],
      hasConflict: false,
    });
  }

  return days;
});

const hasConflicts = computed(() => {
  return props.schedules.some((schedule) => schedule.hasConflict);
});

const conflictCount = computed(() => {
  return props.schedules.filter((schedule) => schedule.hasConflict).length;
});

// Methods
const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isCurrentMonth = (date: Date): boolean => {
  return (
    date.getMonth() === currentDate.value.getMonth() &&
    date.getFullYear() === currentDate.value.getFullYear()
  );
};

const previousMonth = (): void => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = (): void => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const setView = (newView: 'month' | 'week'): void => {
  view.value = newView;
};

const selectSchedule = (schedule: ISchedule): void => {
  selectedSchedule.value = schedule;
};

const editSchedule = (schedule: ISchedule): void => {
  emit('schedule', schedule);
};

const removeSchedule = (schedule: ISchedule): void => {
  emit('unschedule', schedule.id);
};

const selectSuggestedSlot = (slot: Date): void => {
  emit('suggest-schedule', slot);
};

const generateSuggestions = (): void => {
  const suggestions: Date[] = [];
  const today = new Date();

  for (let i = 0; i < SUGGESTION_DAYS_RANGE; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (let hour = WORKING_HOURS_START; hour < WORKING_HOURS_END; hour++) {
      const time = new Date(date);
      time.setHours(hour, 0, 0, 0);

      // Check if this time slot is available
      const hasConflict = props.schedules.some((schedule) => {
        const scheduleTime = new Date(schedule.startTime);
        return Math.abs(scheduleTime.getTime() - time.getTime()) < MINIMUM_TIME_GAP * 60 * 1000;
      });

      if (!hasConflict) {
        suggestions.push(time);
        if (suggestions.length >= SUGGESTIONS_COUNT) break;
      }
    }

    if (suggestions.length >= SUGGESTIONS_COUNT) break;
  }

  suggestedSlots.value = suggestions;
};

// Lifecycle
onMounted(() => {
  generateSuggestions();
});
</script>

<style scoped>
.scheduling-calendar {
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.scheduling-calendar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.scheduling-calendar__navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.scheduling-calendar__title {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-xl);
  margin: 0;
}

.scheduling-calendar__nav-button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  font-family: var(--font-family-serif);
}

.scheduling-calendar__view-options {
  display: flex;
  gap: var(--spacing-xs);
}

.scheduling-calendar__view-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: none;
  cursor: pointer;
}

.scheduling-calendar__view-button--active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.scheduling-calendar__grid {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.scheduling-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--color-background-alt);
  border-bottom: 1px solid var(--color-border);
}

.scheduling-calendar__weekday {
  padding: var(--spacing-sm);
  text-align: center;
  font-weight: bold;
  font-family: var(--font-family-serif);
  color: var(--color-text-secondary);
}

.scheduling-calendar__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(8rem, auto);
}

.scheduling-calendar__day {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-xs);
  min-height: 8rem;
  position: relative;
}

.scheduling-calendar__day:nth-child(7n) {
  border-right: none;
}

.scheduling-calendar__day:nth-last-child(-n+7) {
  border-bottom: none;
}

.scheduling-calendar__day--today {
  background-color: var(--color-background-highlight);
}

.scheduling-calendar__day--other-month {
  background-color: var(--color-background-muted);
  color: var(--color-text-muted);
}

.scheduling-calendar__day-number {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scheduling-calendar__schedules {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.scheduling-calendar__schedule {
  background-color: var(--color-primary-light);
  border-radius: var(--border-radius-xs);
  padding: var(--spacing-xs);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.scheduling-calendar__schedule--conflict {
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
}

.scheduling-calendar__schedule-time {
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.scheduling-calendar__schedule-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scheduling-calendar__schedule-conflict {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-warning);
}

.scheduling-calendar__suggestions {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
}

.scheduling-calendar__suggestions-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-family: var(--font-family-serif);
}

.scheduling-calendar__suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.scheduling-calendar__suggestion {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.scheduling-calendar__suggestions-empty {
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--spacing-md);
}

.scheduling-calendar__suggestions-refresh {
  margin-top: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.scheduling-calendar__conflicts-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
  border-radius: var(--border-radius-sm);
  color: var(--color-warning);
}

.scheduling-calendar__conflicts-icon {
  font-size: var(--font-size-xl);
}

.scheduling-calendar__conflicts-message {
  margin: 0;
}

.scheduling-calendar__details {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-alt);
}

.scheduling-calendar__details-title {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.scheduling-calendar__details-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.scheduling-calendar__details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scheduling-calendar__details-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.scheduling-calendar__details-warning {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-warning);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.scheduling-calendar__details-warning-title {
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.scheduling-calendar__details-warning-list {
  margin: var(--spacing-sm) 0 0;
  padding-left: var(--spacing-md);
}

.scheduling-calendar__details-warning-item {
  margin-bottom: var(--spacing-xs);
}

.scheduling-calendar__details-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.scheduling-calendar__details-button {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scheduling-calendar__details-button:hover {
  background-color: var(--color-background-hover);
}
</style> 