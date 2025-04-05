<!--
# LoadingSpinner

A flexible loading spinner component that indicates a loading state to users.

## Features

- Three sizes: small, medium (default), and large
- Customizable loading text
- Fully accessible with proper ARIA attributes
- Animated spinning indicator
- Follows project design system

## Usage

### Basic Usage

```vue
<template>
  <LoadingSpinner />
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue'
</script>
```

### Size Variants

```vue
<template>
  <LoadingSpinner size="sm" />
  <LoadingSpinner size="md" />
  <LoadingSpinner size="lg" />
</template>
```

### Custom Text

```vue
<template>
  <LoadingSpinner text="Processing your request..." />
</template>
```

### Without Text

```vue
<template>
  <LoadingSpinner text="" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the loading spinner |
| `text` | `string` | `'Loading...'` | Text to display below the spinner. If empty, no text is displayed, but screen readers will still announce "Loading" |

## Accessibility

- Uses `role="status"` to announce its state to screen readers
- Uses `aria-live="polite"` to ensure screen readers announce changes
- Provides text for screen readers even when visible text is not displayed
- Hides the actual spinner from screen readers with `aria-hidden="true"`
-->

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  text: 'Loading...',
})
</script>

<template>
  <div 
    class="loading-spinner" 
    :class="`loading-spinner--${size}`"
    role="status"
    aria-live="polite"
  >
    <div class="loading-spinner__spinner" aria-hidden="true"></div>
    <p v-if="text" class="loading-spinner__text">{{ text }}</p>
    <span class="sr-only" v-if="text">{{ text }}</span>
    <span class="sr-only" v-else>Loading</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-spinner__spinner {
  display: inline-block;
  border: 0.1875rem solid var(--color-border);
  border-radius: 50%;
  border-top-color: var(--color-info);
  animation: spin 1s linear infinite;
}

.loading-spinner--sm .loading-spinner__spinner {
  width: var(--spacing-md);
  height: var(--spacing-md);
}

.loading-spinner--md .loading-spinner__spinner {
  width: var(--spacing-lg);
  height: var(--spacing-lg);
}

.loading-spinner--lg .loading-spinner__spinner {
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
}

.loading-spinner__text {
  margin-top: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.sr-only {
  position: absolute;
  width: 0.0625rem;
  height: 0.0625rem;
  padding: 0;
  margin: -0.0625rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
