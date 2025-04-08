<!--
FormError Component

A reusable error message component for displaying form-level errors.
Follows atomic design principles and uses semantic variables for styling.

Features:
- Semantic error styling
- Accessible error messaging with ARIA attributes
- Type-safe props
- Clear visual feedback

Props:
| Name      | Type   | Default | Description                    |
|-----------|--------|---------|--------------------------------|
| message   | string | ''      | Error message to display       |
| className | string | ''      | Additional CSS classes         |
| id        | string | undefined | Unique identifier for the error |

Accessibility:
- Uses role="alert" for screen reader announcements
- Provides clear error messaging
- Maintains proper color contrast
- Supports keyboard navigation

Usage:
```vue
<FormError 
  message="Invalid email or password"
  className="login-form__error"
/>
```
-->

<template>
  <p v-if="message" class="form-error" role="alert" :class="className">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string | null;
    className?: string;
    id?: string;
  }>(),
  {
    message: '',
    className: '',
    id: undefined,
  }
);
</script>

<style scoped>
.form-error {
  color: var(--color-danger);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
  text-align: center;
}
</style>
