<!--
FormGroup Component

A form group molecule that combines an InputField with error handling.
Follows atomic design principles and uses semantic variables for styling.

Features:
- Combines InputField and error handling
- Consistent form field styling
- Type-safe props
- Accessible form controls
- Proper error state management

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
- Inherits accessibility features from InputField
- Maintains proper form structure
- Provides clear error feedback
- Supports keyboard navigation

Usage:
```vue
<FormGroup
  id="email"
  label="Email"
  type="email"
  v-model="email"
  :error="errors.email"
  required
  className="login-form__field"
/>
```
-->

<template>
  <div class="form-group" :class="className">
    <InputField
      :id="id"
      :label="label"
      :type="type"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :error="error"
      :required="required"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import InputField from '@/components/atoms/InputField.vue'
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
.form-group {
  margin-bottom: var(--spacing-md);
}
</style>
