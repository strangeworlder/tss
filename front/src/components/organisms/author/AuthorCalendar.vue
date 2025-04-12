<!--
AuthorCalendar.vue
Component name: AuthorCalendar
Description: Author-specific extension of the SchedulingCalendar component
Features:
- Extends the generic SchedulingCalendar component
- Adds author-specific functionality
- Handles author-specific scheduling rules
- Provides author-specific UI enhancements
Usage:
<template>
  <AuthorCalendar
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
- Inherits accessibility features from SchedulingCalendar
-->

<template>
  <div class="author-calendar">
    <SchedulingCalendar
      :schedules="schedules"
      @schedule="handleSchedule"
      @unschedule="handleUnschedule"
      @suggest-schedule="handleSuggestSchedule"
    />
    
    <div v-if="hasAuthorSpecificFeatures" class="author-calendar__author-options">
      <h3 class="author-calendar__options-title">Author Options</h3>
      <div class="author-calendar__options-content">
        <div class="author-calendar__options-group">
          <label class="author-calendar__option-label">
            <input
              type="checkbox"
              v-model="autoPublish"
              class="author-calendar__option-checkbox"
            />
            Auto-publish at scheduled time
          </label>
        </div>
        <div class="author-calendar__options-group">
          <label class="author-calendar__option-label">
            <input
              type="checkbox"
              v-model="notifyOnPublish"
              class="author-calendar__option-checkbox"
            />
            Send notification on publish
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import SchedulingCalendar from '@/components/organisms/calendar/SchedulingCalendar.vue';
import type { ISchedule } from '@/types/scheduling';

interface Props {
  schedules: ISchedule[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'schedule', schedule: ISchedule): void;
  (e: 'unschedule', scheduleId: string): void;
  (e: 'suggest-schedule', suggestedTime: Date): void;
}>();

const handleSchedule = (schedule: ISchedule): void => {
  emit('schedule', schedule);
};

const handleUnschedule = (scheduleId: string): void => {
  emit('unschedule', scheduleId);
};

const handleSuggestSchedule = (suggestedTime: Date): void => {
  emit('suggest-schedule', suggestedTime);
};

// Author-specific state
const autoPublish = ref(true);
const notifyOnPublish = ref(true);
const hasAuthorSpecificFeatures = ref(true);
</script>

<style scoped>
.author-calendar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.author-calendar__author-options {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.author-calendar__options-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.author-calendar__options-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.author-calendar__options-group {
  display: flex;
  align-items: center;
}

.author-calendar__option-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.author-calendar__option-checkbox {
  width: 18px;
  height: 18px;
}
</style>
