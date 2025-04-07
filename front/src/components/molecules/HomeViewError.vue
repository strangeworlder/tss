<!--
Features:
- Displays error message with proper styling
- Includes retry button
- Fully accessible
- Handles null error messages

Usage:
```vue
<HomeViewError 
  :error="error"
  @retry="handleRetry"
/>
```

Props:
- error: string | null - The error message to display
- className?: string - Optional CSS class name for styling

Events:
- retry: Emitted when retry button is clicked
-->
<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';

interface Props {
  error: string | null;
  className?: string;
}

defineProps<Props>();
const emit = defineEmits<(e: 'retry') => void>();

const handleRetry = () => {
  emit('retry');
};
</script>

<template>
  <div 
    v-if="error"
    class="home-view-error"
    :class="className"
    role="alert"
  >
    <p class="home-view-error__message">{{ error }}</p>
    <AppButton 
      @click="handleRetry"
      :variant="ButtonVariantEnum.DANGER"
    >
      Try Again
    </AppButton>
  </div>
</template>

<style scoped>
.home-view-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-error);
}

.home-view-error__message {
  color: var(--color-danger);
  font-size: var(--font-size-md);
  text-align: center;
  margin: 0;
}
</style> 