<!--
ContentStatus.vue
Component name: ContentStatus
Description: Author-specific content status component
Features:
- Extends generic StatusIndicator component
- Content-specific status types and labels
- Status history tracking
- Accessibility compliant
Usage:
<template>
  <ContentStatus :status="contentStatus" :history="statusHistory" />
</template>
Props:
- status: string - The current content status
- history?: IStatusHistory[] - Optional status history
Accessibility:
- Inherits accessibility features from StatusIndicator
-->

<template>
  <div class="content-status">
    <h3 class="content-status__title">Content Status</h3>
    
    <div class="content-status__indicator">
      <StatusIndicator
        :status="status"
        :history="history"
        :show-icon="true"
        :show-history="showHistory"
        :history-title="'Status History'"
        :icons="contentStatusIcons"
        :labels="contentStatusLabels"
        :status-classes="contentStatusClasses"
      />
    </div>
    
    <div v-if="showStatusInfo" class="content-status__info">
      <div class="content-status__info-card">
        <h4 class="content-status__info-title">{{ statusInfoTitle }}</h4>
        <p class="content-status__info-description">{{ statusInfoDescription }}</p>
        <div v-if="statusActions.length > 0" class="content-status__actions">
          <button 
            v-for="(action, index) in statusActions" 
            :key="index"
            class="content-status__action-button"
            @click="handleAction(action.action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StatusIndicator from '@/components/atoms/status/StatusIndicator.vue';

interface IStatusHistory {
  id: string;
  date: Date;
  status: string;
  note?: string;
}

interface IStatusAction {
  label: string;
  action: string;
}

// Props
const props = defineProps<{
  status: string;
  history?: IStatusHistory[];
  showHistory?: boolean;
  showStatusInfo?: boolean;
}>();

// Emit
const emit = defineEmits<(e: 'action', action: string) => void>();

// Content-specific status mappings
const contentStatusIcons = {
  draft: '📝',
  scheduled: '⏰',
  published: '✅',
  archived: '🗄️',
  error: '❌',
  'in-review': '👁️',
  'needs-revision': '✏️',
  'pending-approval': '⏳',
};

const contentStatusLabels = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
  error: 'Error',
  'in-review': 'In Review',
  'needs-revision': 'Needs Revision',
  'pending-approval': 'Pending Approval',
};

const contentStatusClasses = {
  draft: 'status-indicator__badge--neutral',
  scheduled: 'status-indicator__badge--info',
  published: 'status-indicator__badge--success',
  archived: 'status-indicator__badge--neutral',
  error: 'status-indicator__badge--danger',
  'in-review': 'status-indicator__badge--info',
  'needs-revision': 'status-indicator__badge--warning',
  'pending-approval': 'status-indicator__badge--info',
};

// Status info content
const statusInfoTitle = computed(() => {
  switch (props.status) {
    case 'draft':
      return 'Draft Content';
    case 'scheduled':
      return 'Scheduled for Publication';
    case 'published':
      return 'Live Content';
    case 'archived':
      return 'Archived Content';
    case 'error':
      return 'Error in Publication';
    case 'in-review':
      return 'Content in Review';
    case 'needs-revision':
      return 'Revisions Needed';
    case 'pending-approval':
      return 'Awaiting Approval';
    default:
      return 'Content Status';
  }
});

const statusInfoDescription = computed(() => {
  switch (props.status) {
    case 'draft':
      return 'This content is still being worked on and is not visible to the public.';
    case 'scheduled':
      return 'This content is scheduled to be published automatically on the specified date.';
    case 'published':
      return 'This content is live and visible to the public.';
    case 'archived':
      return 'This content has been archived and is no longer visible to the public.';
    case 'error':
      return 'There was an error publishing this content. Please check the logs for details.';
    case 'in-review':
      return 'This content is currently being reviewed by an editor.';
    case 'needs-revision':
      return 'This content requires revisions based on editorial feedback.';
    case 'pending-approval':
      return 'This content is awaiting final approval before publication.';
    default:
      return 'Current status information for this content.';
  }
});

const statusActions = computed((): IStatusAction[] => {
  switch (props.status) {
    case 'draft':
      return [
        { label: 'Publish Now', action: 'publish' },
        { label: 'Schedule', action: 'schedule' },
      ];
    case 'scheduled':
      return [
        { label: 'Publish Now', action: 'publish' },
        { label: 'Cancel Schedule', action: 'cancel-schedule' },
      ];
    case 'published':
      return [
        { label: 'Unpublish', action: 'unpublish' },
        { label: 'Archive', action: 'archive' },
      ];
    case 'archived':
      return [{ label: 'Restore', action: 'restore' }];
    case 'error':
      return [
        { label: 'Retry', action: 'retry' },
        { label: 'Edit', action: 'edit' },
      ];
    case 'in-review':
      return [{ label: 'Submit Revision', action: 'submit-revision' }];
    case 'needs-revision':
      return [
        { label: 'Edit', action: 'edit' },
        { label: 'Submit Revision', action: 'submit-revision' },
      ];
    case 'pending-approval':
      return [
        { label: 'Edit', action: 'edit' },
        { label: 'Request Expedited Review', action: 'expedite-review' },
      ];
    default:
      return [];
  }
});

// Methods
const handleAction = (action: string) => {
  emit('action', action);
};
</script>

<style scoped>
.content-status {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.content-status__title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.content-status__indicator {
  margin-bottom: var(--spacing-sm);
}

.content-status__info {
  margin-top: var(--spacing-sm);
}

.content-status__info-card {
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border);
}

.content-status__info-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.content-status__info-description {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.content-status__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.content-status__action-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.content-status__action-button:hover {
  background-color: var(--color-background-muted);
}
</style>
