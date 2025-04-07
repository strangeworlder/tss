<!--
@component CommentForm
@description A form component for creating and editing comments.

@features
- Creates new comments or replies to existing comments
- Validates input before submission
- Supports markdown formatting
- Shows loading state during submission
- Displays error messages
- Responsive design

@props {
  parentId: {
    type: string
    required: true
    description: "ID of the parent post or comment"
  }
  parentType: {
    type: CommentParentTypeEnum
    required: true
    description: "Type of the parent ('post' or 'comment')"
  }
  isReply: {
    type: boolean
    default: false
    description: "Whether this form is for a reply to another comment"
  }
}

@events {
  submit: {
    description: "Emitted when the form is successfully submitted"
  }
  cancel: {
    description: "Emitted when the user cancels the form"
  }
  error: {
    payload: string
    description: "Emitted when an error occurs during submission"
  }
}

@accessibility
- Uses semantic HTML form elements
- Provides clear error messages
- Maintains proper focus management
- Uses proper ARIA attributes only when necessary
-->

<template>
  <form class="comment-form" @submit.prevent="handleSubmit" novalidate>
    <div class="comment-form__field">
      <label for="title" class="comment-form__label">Title (optional)</label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        class="comment-form__input"
        placeholder="Add a title to your comment"
      />
    </div>

    <div class="comment-form__field">
      <label for="content" class="comment-form__label">Comment</label>
      <textarea
        id="content"
        v-model="formData.content"
        class="comment-form__textarea"
        rows="4"
        placeholder="Write your comment here..."
        required
      ></textarea>
      <p v-if="errors.content" class="comment-form__error">{{ errors.content }}</p>
    </div>

    <div class="comment-form__actions">
      <button
        type="button"
        class="comment-form__button comment-form__button--cancel"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="comment-form__button comment-form__button--submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { createComment } from '@/api/commentService';
import type { ICommentFormProps } from '@/types/form';

interface IFormData {
  title: string;
  content: string;
}

interface IFormErrors {
  title?: string;
  content?: string;
}

const props = withDefaults(defineProps<ICommentFormProps>(), {
  isReply: false,
});

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'error', message: string): void;
}>();

const formData = reactive<IFormData>({
  title: '',
  content: '',
});

const errors = reactive<IFormErrors>({});
const isSubmitting = ref<boolean>(false);

const validateForm = (): boolean => {
  if (!formData.content?.trim()) {
    errors.content = 'Content is required';
    return false;
  }
  return true;
};

const handleSubmit = async (): Promise<void> => {
  errors.title = undefined;
  errors.content = undefined;

  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;

    if (!props.parentId || !props.parentType) {
      throw new Error('Missing required parent information');
    }

    await createComment({
      title: formData.title?.trim() || 'Untitled Comment',
      content: formData.content?.trim() || '',
      parentId: props.parentId,
      parentType: props.parentType,
    });

    emit('submit');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to submit comment';
    emit('error', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = (): void => {
  emit('cancel');
};
</script>

<style scoped>
.comment-form {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
}

.comment-form__field {
  margin-bottom: var(--spacing-md);
}

.comment-form__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.comment-form__input,
.comment-form__textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  font-family: var(--font-family-base);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background: var(--color-background);
  transition: border-color 0.2s;
}

.comment-form__input:focus,
.comment-form__textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.comment-form__textarea {
  resize: vertical;
  min-height: 6rem;
}

.comment-form__error {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.comment-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.comment-form__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: 0.25rem;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s;
}

.comment-form__button--cancel {
  background: var(--color-background-alt);
  color: var(--color-text);
}

.comment-form__button--cancel:hover {
  background: var(--color-background-muted);
}

.comment-form__button--submit {
  background: var(--color-primary-500);
  color: white;
}

.comment-form__button--submit:hover {
  background: var(--color-primary-600);
}

.comment-form__button--submit:disabled {
  background: var(--color-neutral-400);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .comment-form {
    padding: var(--spacing-sm);
  }

  .comment-form__actions {
    flex-direction: column;
  }

  .comment-form__button {
    width: 100%;
  }
}
</style>
