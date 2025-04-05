<template>
  <form @submit.prevent="handleSubmit" class="comment-form">
    <div class="comment-form__header">
      <h3 class="comment-form__title">{{ isReply ? 'Reply' : 'Add a Comment' }}</h3>
    </div>

    <div class="comment-form__field">
      <label for="title" class="comment-form__label">Title</label>
      <input
        id="title"
        v-model="title"
        type="text"
        class="comment-form__input"
        :class="{ 'comment-form__input--error': errors.title }"
        placeholder="Enter a title for your comment"
      />
      <div v-if="errors.title" class="comment-form__error">{{ errors.title }}</div>
    </div>

    <div class="comment-form__field">
      <label for="content" class="comment-form__label">Content</label>
      <textarea
        id="content"
        v-model="content"
        class="comment-form__textarea"
        :class="{ 'comment-form__textarea--error': errors.content }"
        rows="4"
        placeholder="Write your comment here..."
      ></textarea>
      <div v-if="errors.content" class="comment-form__error">{{ errors.content }}</div>
    </div>

    <div class="comment-form__actions">
      <Button type="submit" variant="primary" :disabled="loading">
        {{ loading ? 'Saving...' : isReply ? 'Reply' : 'Comment' }}
      </Button>
      <Button v-if="isReply" type="button" variant="secondary" @click="$emit('cancel')">
        Cancel
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { createComment } from '@/api/commentService'
import Button from '@/components/atoms/Button.vue'

const props = defineProps<{
  parentId: string
  parentType: 'post' | 'comment'
  isReply?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'cancel'): void
  (e: 'success'): void
  (e: 'error', message: string): void
}>()

const authStore = useAuthStore()
const title = ref('')
const content = ref('')
const loading = ref(false)
const errors = ref({
  title: '',
  content: '',
})

const validateForm = () => {
  errors.value = {
    title: '',
    content: '',
  }

  if (!title.value.trim()) {
    errors.value.title = 'Title is required'
    return false
  }

  if (!content.value.trim()) {
    errors.value.content = 'Content is required'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    await createComment(title.value.trim(), content.value.trim(), props.parentId, props.parentType)

    title.value = ''
    content.value = ''
    emit('success')
    emit('submit')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create comment'
    emit('error', message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comment-form {
  padding: var(--spacing-4);
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.comment-form__header {
  margin-bottom: var(--spacing-4);
}

.comment-form__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.comment-form__field {
  margin-bottom: var(--spacing-4);
}

.comment-form__label {
  display: block;
  margin-bottom: var(--spacing-1);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.comment-form__input,
.comment-form__textarea {
  width: 100%;
  padding: var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.comment-form__input:focus,
.comment-form__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.comment-form__input--error,
.comment-form__textarea--error {
  border-color: var(--color-error);
}

.comment-form__error {
  margin-top: var(--spacing-1);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.comment-form__actions {
  display: flex;
  gap: var(--spacing-2);
  justify-content: flex-end;
}
</style>
