<!--
  TextArea
  A reusable textarea component that follows our design system and accessibility guidelines.
  
  Features:
  - Semantic HTML with proper labeling
  - Error state handling
  - Customizable rows
  - Follows design system spacing and colors
  
  Usage:
  <TextArea
    id="description"
    v-model="description"
    label="Description"
    :error="errors.description"
    rows="4"
  />
  
  Props:
  - id: string (required) - Unique identifier for the textarea
  - modelValue: string (required) - v-model binding value
  - label: string (required) - Label text for the textarea
  - error: string (optional) - Error message to display
  - rows: number (optional) - Number of visible text rows (default: 4)
  - placeholder: string (optional) - Placeholder text
  
  Accessibility:
  - Uses semantic label element with proper for/id association
  - Error messages are associated with the input using aria-describedby
  - Maintains proper color contrast ratios
-->

<template>
  <div class="textarea-field">
    <label :for="id" class="textarea-field__label">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      class="textarea-field__input"
      :class="{ 'textarea-field__input--error': error }"
      :rows="rows"
      :placeholder="placeholder"
      :aria-describedby="error ? `${id}-error` : undefined"
    ></textarea>
    <FormError v-if="error" :id="`${id}-error`" :message="error" />
  </div>
</template>

<script setup lang="ts">
import type { ITextAreaProps } from '@/types/form'
import FormError from '@/components/atoms/FormError.vue'

withDefaults(defineProps<ITextAreaProps>(), {
  rows: 4,
  error: '',
  placeholder: '',
})

defineEmits<(e: 'update:modelValue', value: string) => void>()
</script>

<style scoped>
.textarea-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.textarea-field__label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.textarea-field__input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background-alt);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  resize: vertical;
  min-height: calc(var(--spacing-md) * 4);
  transition: border-color var(--transition-fast);
}

.textarea-field__input:focus {
  outline: none;
  border-color: var(--color-border-hover);
}

.textarea-field__input--error {
  border-color: var(--color-danger);
}

.textarea-field__input::placeholder {
  color: var(--color-text-muted);
}
</style>
