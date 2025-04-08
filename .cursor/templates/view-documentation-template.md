# View Component Documentation

## Overview
This document provides guidelines and examples for creating view components in our application. Views are the top-level components that represent entire pages and should follow our atomic design principles.

## BaseView Component

The `BaseView` component serves as the foundation for all views in our application. It provides a consistent structure and styling while allowing customization through props and slots.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | '' | The title of the view, displayed in the header |
| variant | 'default' \| 'narrow' \| 'wide' | 'default' | Controls the width of the view content |
| showHeader | boolean | true | Whether to show the header section |
| showFooter | boolean | true | Whether to show the footer section |

### Slots

| Slot | Description |
|------|-------------|
| header | Content to be displayed in the header section |
| default | Main content of the view |
| footer | Content to be displayed in the footer section |

## View Structure

Every view should follow this basic structure:

```vue
<template>
  <BaseView
    title="View Title"
    variant="default"
    :showHeader="true"
    :showFooter="true"
  >
    <template #header>
      <!-- Optional header content -->
    </template>

    <!-- Main content -->
    <div class="view-name">
      <!-- View content here -->
    </div>

    <template #footer>
      <!-- Optional footer content -->
    </template>
  </BaseView>
</template>
```

## Styling Guidelines

1. Use BEM syntax for CSS classes:
   ```css
   .view-name { }
   .view-name__header { }
   .view-name__content { }
   .view-name__footer { }
   ```

2. Use semantic variables for colors and spacing:
   ```css
   .view-name {
     background-color: var(--color-background);
     padding: var(--spacing-md);
   }
   ```

3. Use rem units for spacing:
   ```css
   .view-name__content {
     margin-top: var(--spacing-lg);
     gap: var(--spacing-md);
   }
   ```

## State Management

Views should handle these common states:

1. Loading state:
   ```vue
   <LoadingSpinner v-if="loading" />
   ```

2. Error state:
   ```vue
   <div v-else-if="error" class="view-name__error">
     <p class="view-name__error-text">{{ error }}</p>
     <AppButton @click="retry">Retry</AppButton>
   </div>
   ```

3. Empty state:
   ```vue
   <div v-else-if="!data" class="view-name__empty">
     <p>No data available</p>
   </div>
   ```

4. Content state:
   ```vue
   <div v-else class="view-name__content">
     <!-- Display data -->
   </div>
   ```

## TypeScript Integration

Views should use TypeScript with proper typing:

```typescript
interface IViewData {
  id: number;
  name: string;
  // ... other properties
}

const data = ref<IViewData | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
```

## Testing Requirements

Every view must have corresponding test files that cover:

1. Rendering tests
2. Props tests
3. Events tests
4. User interaction tests
5. Accessibility tests
6. Styling tests
7. Edge cases

## Accessibility Considerations

1. Use semantic HTML elements
2. Maintain proper heading hierarchy
3. Ensure keyboard navigation
4. Provide meaningful labels and descriptions
5. Test with screen readers

## Example Implementation

Here's a complete example of a view component:

```vue
<!--
  @component ProfileView
  @description Displays and manages user profile information
  @features
  - Display user profile information
  - Edit profile details
  - Upload profile picture
  - Show success/error messages
  @accessibility
  - Uses semantic HTML
  - Maintains proper heading hierarchy
  - Provides clear error messages
  - Ensures keyboard navigation
-->

<script setup lang="ts">
import { ref } from 'vue';
import BaseView from '@/components/templates/BaseView.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import type { IUserProfile } from '@/types';

const loading = ref(false);
const error = ref<string | null>(null);
const profile = ref<IUserProfile | null>(null);

const fetchProfile = async (): Promise<void> => {
  loading.value = true;
  error.value = null;
  try {
    // Fetch profile data
    profile.value = await fetchProfileData();
  } catch (e) {
    error.value = 'Failed to load profile';
  } finally {
    loading.value = false;
  }
};

// Initial fetch
fetchProfile();
</script>

<template>
  <BaseView
    title="Profile"
    variant="narrow"
  >
    <div class="profile-view">
      <LoadingSpinner v-if="loading" />
      
      <div v-else-if="error" class="profile-view__error">
        <p class="profile-view__error-text">{{ error }}</p>
        <AppButton @click="fetchProfile">Retry</AppButton>
      </div>
      
      <div v-else-if="!profile" class="profile-view__empty">
        <p>No profile data available</p>
      </div>
      
      <div v-else class="profile-view__content">
        <!-- Profile content -->
      </div>
    </div>
  </BaseView>
</template>

<style scoped>
.profile-view {
  background-color: var(--color-background);
  padding: var(--spacing-md);
}

.profile-view__error {
  text-align: center;
  padding: var(--spacing-lg);
}

.profile-view__error-text {
  color: var(--color-danger);
  margin-bottom: var(--spacing-md);
}

.profile-view__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>
```

## Best Practices

1. Always use the BaseView component as the root element
2. Follow BEM naming convention for CSS classes
3. Use semantic variables for styling
4. Handle all possible states (loading, error, empty, content)
5. Implement proper TypeScript types
6. Write comprehensive tests
7. Ensure accessibility compliance
8. Document the component thoroughly 