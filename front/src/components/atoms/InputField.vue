<!--
InputField Component

A reusable form input component that handles text input with label and error states.
Follows atomic design principles and uses semantic variables for styling.

Features:
- Label and input field combination
- Error state handling with ARIA attributes
- Semantic styling using CSS variables
- Accessible form controls
- Type-safe props

Props:
| Name        | Type    | Default  | Description                    |
|-------------|---------|----------|--------------------------------|
| id          | string  | required | Unique identifier for input    |
| label       | string  | required | Label text for the input       |
| type        | string  | 'text'   | Input type (text, email, etc.) |
| modelValue  | string  | required | v-model value                  |
| error       | string  | ''       | Error message to display       |
| required    | boolean | false    | Whether input is required      |
| placeholder | string  | ''       | Placeholder text              |
| disabled    | boolean | false    | Whether input is disabled      |
| className   | string  | ''       | Additional CSS classes         |

Accessibility:
- Uses semantic HTML with proper label-input association
- Provides error feedback through aria-invalid and aria-describedby
- Maintains proper focus management
- Supports keyboard navigation
- Provides clear error messaging for screen readers

Usage:
```vue
<InputField
  id="email"
  label="Email"
  type="email"
  v-model="email"
  :error="errors.email"
  required
/>
```
-->

<template>
  <div class="input-field" :class="[{ 'input-field--error': error }, className]">
    <label :for="id" class="input-field__label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="input-field__input"
      :required="required"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
    />
    <p v-if="error" :id="`${id}-error`" class="input-field__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { IFormFieldProps } from '@/types/form'

withDefaults(defineProps<IFormFieldProps>(), {
  type: 'text',
  required: false,
  placeholder: '',
  disabled: false,
  className: '',
})

defineEmits<(e: 'update:modelValue', value: string) => void>()
</script>

<style scoped>
.input-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.input-field__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.input-field__input {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  background-color: var(--color-background);
  color: var(--color-text);
  transition: border-color var(--transition-fast);
}

.input-field__input:focus {
  outline: none;
  border-color: var(--color-border-hover);
}

.input-field__input:disabled {
  background-color: var(--color-background-muted);
  cursor: not-allowed;
}

.input-field--error .input-field__input {
  border-color: var(--color-danger);
}

.input-field__error {
  color: var(--color-danger);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
}
</style>
