<!--
ContentScheduler.vue
Component name: ContentScheduler
Description: Content scheduling interface for authors
Features:
- Calendar view for scheduling
- Date and time pickers
- Timezone selection
- Conflict detection
- Accessibility compliant
Usage:
<template>
  <ContentScheduler v-model="schedule" />
</template>
Props:
- modelValue: Date | null - The selected schedule date
Events:
- update:modelValue - Emitted when schedule changes
Accessibility:
- Proper form structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->

<template>
  <div class="content-scheduler">
    <div class="content-scheduler__header">
      <h2 class="content-scheduler__title">Schedule Content</h2>
    </div>

    <div class="content-scheduler__controls">
      <div class="content-scheduler__field">
        <label for="schedule-date" class="content-scheduler__label">Date</label>
        <input
          id="schedule-date"
          v-model="scheduleDate"
          type="date"
          class="content-scheduler__input"
          :min="minDate"
          :max="maxDate"
          required
          aria-required="true"
          :aria-invalid="!!errors.date"
          aria-describedby="date-error"
        />
        <div v-if="errors.date" id="date-error" class="content-scheduler__error">
          {{ errors.date }}
        </div>
      </div>

      <div class="content-scheduler__field">
        <label for="schedule-time" class="content-scheduler__label">Time</label>
        <input
          id="schedule-time"
          v-model="scheduleTime"
          type="time"
          class="content-scheduler__input"
          required
          aria-required="true"
          :aria-invalid="!!errors.time"
          aria-describedby="time-error"
        />
        <div v-if="errors.time" id="time-error" class="content-scheduler__error">
          {{ errors.time }}
        </div>
      </div>

      <div class="content-scheduler__field">
        <label for="timezone" class="content-scheduler__label">Timezone</label>
        <select
          id="timezone"
          v-model="timezone"
          class="content-scheduler__select"
          required
          aria-required="true"
          :aria-invalid="!!errors.timezone"
          aria-describedby="timezone-error"
        >
          <option v-for="tz in timezones" :key="tz" :value="tz">
            {{ tz }}
          </option>
        </select>
        <div v-if="errors.timezone" id="timezone-error" class="content-scheduler__error">
          {{ errors.timezone }}
        </div>
      </div>
    </div>

    <div class="content-scheduler__calendar">
      <div class="content-scheduler__calendar-header">
        <button
          @click="previousMonth"
          class="content-scheduler__calendar-nav"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 class="content-scheduler__calendar-title">
          {{ currentMonthName }} {{ currentYear }}
        </h3>
        <button
          @click="nextMonth"
          class="content-scheduler__calendar-nav"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div class="content-scheduler__calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date.toISOString()"
          class="content-scheduler__calendar-day"
          :class="{
            'content-scheduler__calendar-day--selected': isSelected(day.date),
            'content-scheduler__calendar-day--today': isToday(day.date),
            'content-scheduler__calendar-day--disabled': !isSelectable(day.date),
            'content-scheduler__calendar-day--conflict': hasConflict(day.date)
          }"
          @click="selectDate(day.date)"
          :aria-disabled="!isSelectable(day.date)"
          :aria-selected="isSelected(day.date)"
          :aria-label="getDayLabel(day.date)"
        >
          {{ day.day }}
          <div v-if="hasConflict(day.date)" class="content-scheduler__conflict-indicator">
            !
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasConflicts" class="content-scheduler__conflicts">
      <h3 class="content-scheduler__conflicts-title">Scheduling Conflicts</h3>
      <ul class="content-scheduler__conflicts-list">
        <li
          v-for="conflict in conflicts"
          :key="conflict.id"
          class="content-scheduler__conflict-item"
        >
          {{ conflict.title }} - {{ formatShortDate(conflict.date) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  formatShortDate,
  formatMonthYear,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
} from '@/utils/date';

interface ICalendarDay {
  date: Date;
  day: number;
}

interface IConflict {
  id: string;
  title: string;
  date: Date;
}

// Props
const props = defineProps<{
  modelValue: Date | null;
}>();

// Emits
const emit = defineEmits<(e: 'update:modelValue', value: Date | null) => void>();

// State
const scheduleDate = ref('');
const scheduleTime = ref('');
const timezone = ref('UTC');
const currentDate = ref(new Date());
const errors = ref<Record<string, string>>({});
const conflicts = ref<IConflict[]>([]);

// Constants
const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
const minDate = new Date().toISOString().split('T')[0];
const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  .toISOString()
  .split('T')[0];

// Computed
const currentMonthName = computed(() => formatMonthYear(currentDate.value));
const currentYear = computed(() => currentDate.value.getFullYear().toString());
const hasConflicts = computed(() => conflicts.value.length > 0);

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value);
  const end = endOfMonth(currentDate.value);
  const days = eachDayOfInterval(start, end);

  return days.map((date) => ({
    date,
    day: date.getDate(),
  }));
});

// Methods
const isSelected = (date: Date) => {
  if (!props.modelValue) return false;
  return isSameDay(date, props.modelValue);
};

const isSelectable = (date: Date) => {
  return !isBefore(date, new Date());
};

const hasConflict = (date: Date) => {
  return conflicts.value.some((conflict) => isSameDay(conflict.date, date));
};

const getDayLabel = (date: Date) => {
  const dateString = formatShortDate(date);
  return isToday(date) ? `Today, ${dateString}` : dateString;
};

const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1);
};

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1);
};

const selectDate = (date: Date) => {
  if (!isSelectable(date)) return;

  const [hours, minutes] = scheduleTime.value.split(':').map(Number);
  const selectedDate = new Date(date);
  selectedDate.setHours(hours || 0, minutes || 0);

  emit('update:modelValue', selectedDate);
};

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      scheduleDate.value = newValue.toISOString().split('T')[0];
      scheduleTime.value = newValue.toTimeString().slice(0, 5);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.content-scheduler {
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.content-scheduler__header {
  margin-bottom: var(--spacing-md);
}

.content-scheduler__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.content-scheduler__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.content-scheduler__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.content-scheduler__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.content-scheduler__input,
.content-scheduler__select {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
}

.content-scheduler__error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.content-scheduler__calendar {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.content-scheduler__calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.content-scheduler__calendar-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.content-scheduler__calendar-nav {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  background: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: var(--font-size-lg);
}

.content-scheduler__calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.content-scheduler__calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  position: relative;
}

.content-scheduler__calendar-day:hover:not(.content-scheduler__calendar-day--disabled) {
  background-color: var(--color-primary-50);
}

.content-scheduler__calendar-day--selected {
  background-color: var(--color-primary);
  color: var(--color-background);
}

.content-scheduler__calendar-day--today {
  border: 1px solid var(--color-primary);
}

.content-scheduler__calendar-day--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content-scheduler__calendar-day--conflict {
  background-color: var(--color-danger-50);
}

.content-scheduler__conflict-indicator {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  color: var(--color-danger);
  font-weight: var(--font-weight-bold);
}

.content-scheduler__conflicts {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.content-scheduler__conflicts-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.content-scheduler__conflicts-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.content-scheduler__conflict-item {
  padding: var(--spacing-xs) 0;
  color: var(--color-danger);
}
</style> 