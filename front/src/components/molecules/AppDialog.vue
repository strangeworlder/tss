<!--
@component AppDialog
@description A reusable dialog component for confirmations and alerts.

@features
- Accessible modal dialog using native dialog element
- Customizable title and content
- Primary and secondary action buttons
- Keyboard navigation support (Esc to close)
- Focus management with focus trap
- Backdrop click to close
- Responsive design

@props {
  isOpen: {
    type: boolean
    required: true
    description: "Controls the visibility of the dialog"
  }
  title: {
    type: string
    required: true
    description: "Dialog title"
  }
  content: {
    type: string
    required: true
    description: "Dialog content"
  }
  primaryAction: {
    type: string
    required: true
    description: "Text for the primary action button"
  }
  secondaryAction: {
    type: string
    required: true
    description: "Text for the secondary action button"
  }
  variant: {
    type: string
    default: 'danger'
    description: "Variant of the primary action button"
    validator: (value) => ['danger', 'primary'].includes(value)
  }
}

@events {
  confirm: {
    description: "Emitted when primary action is clicked"
  }
  cancel: {
    description: "Emitted when secondary action is clicked or dialog is closed"
  }
}

@accessibility
- Uses native dialog element for proper modal behavior
- Implements focus trap within the dialog
- Handles keyboard navigation (Esc to close)
- Maintains proper heading hierarchy
- High contrast for important actions
- Manages focus when dialog opens/closes
- Relies on native HTML semantics for accessibility
-->

<template>
  <dialog
    ref="dialogRef"
    class="app-dialog"
    :open="isOpen"
    @close="handleClose"
    @keydown.esc="handleClose"
  >
    <div class="app-dialog__content">
      <h2 class="app-dialog__title">{{ title }}</h2>
      <p class="app-dialog__message">{{ content }}</p>
      <div class="app-dialog__actions">
        <AppButton
          ref="secondaryButtonRef"
          :variant="ButtonVariantEnum.TEXT"
          @click="handleCancel"
        >
          {{ secondaryAction }}
        </AppButton>
        <AppButton
          ref="primaryButtonRef"
          :variant="variant === 'danger' ? ButtonVariantEnum.DANGER : ButtonVariantEnum.PRIMARY"
          @click="handleConfirm"
        >
          {{ primaryAction }}
        </AppButton>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { Ref } from 'vue';
import type AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';

interface Props {
  isOpen: boolean;
  title: string;
  content: string;
  primaryAction: string;
  secondaryAction: string;
  variant?: 'danger' | 'primary';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'danger',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const dialogRef: Ref<HTMLDialogElement | null> = ref(null);
const primaryButtonRef: Ref<InstanceType<typeof AppButton> | null> = ref(null);
const secondaryButtonRef: Ref<InstanceType<typeof AppButton> | null> = ref(null);
let previousActiveElement: Element | null = null;

// Handle click outside the dialog
const handleBackdropClick = (event: MouseEvent): void => {
  if (event.target === dialogRef.value) {
    handleClose();
  }
};

// Handle dialog close
const handleClose = (): void => {
  emit('cancel');
};

// Handle cancel button click
const handleCancel = (): void => {
  handleClose();
};

// Handle confirm button click
const handleConfirm = (): void => {
  emit('confirm');
};

// Focus trap implementation
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key !== 'Tab') return;

  const focusableElements = dialogRef.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (!focusableElements?.length) return;

  const firstFocusableElement = focusableElements[0] as HTMLElement;
  const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  if (event.shiftKey) {
    if (document.activeElement === firstFocusableElement) {
      lastFocusableElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastFocusableElement) {
      firstFocusableElement.focus();
      event.preventDefault();
    }
  }
};

// Watch for isOpen changes to handle dialog visibility and focus
watch(
  () => props.isOpen,
  async (newValue) => {
    if (newValue && dialogRef.value) {
      previousActiveElement = document.activeElement;
      dialogRef.value.showModal();
      await nextTick();
      // Focus the primary action button by default
      primaryButtonRef.value?.$el?.focus();
    } else if (dialogRef.value) {
      dialogRef.value.close();
      // Restore focus to the previous element
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    }
  }
);

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('click', handleBackdropClick);
  dialogRef.value?.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleBackdropClick);
  dialogRef.value?.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.app-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
  max-width: 90%;
  width: 28rem;
}

.app-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.app-dialog__content {
  padding: var(--spacing-lg);
}

.app-dialog__title {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.app-dialog__message {
  margin: 0 0 var(--spacing-lg);
  color: var(--color-text);
  line-height: 1.5;
}

.app-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

@media (max-width: 48rem) {
  .app-dialog {
    width: 95%;
  }
}
</style> 