# View Architecture Guidelines

## BaseView Component

All views in the application MUST use the BaseView component as a foundation. The BaseView component provides:

- Consistent layout structure
- Standardized header and footer
- Responsive content areas
- Semantic HTML structure

### BaseView Props

The BaseView component accepts the following props:

- `title`: string (optional) - The title displayed in the header
- `variant`: 'default' | 'narrow' | 'wide' | 'full' (optional) - Controls the width of the content area
- `showHeader`: boolean (optional) - Controls whether the header is displayed
- `showFooter`: boolean (optional) - Controls whether the footer is displayed

### BaseView Slots

The BaseView component provides the following slots:

- `header` (optional) - Custom header content
- `default` (required) - Main content
- `footer` (optional) - Custom footer content

## View Structure

All views MUST follow this structure:

```vue
<template>
  <BaseView 
    title="View Title" 
    variant="narrow"
  >
    <template #header>
      <!-- Custom header content -->
    </template>
    
    <!-- Main content -->
  </BaseView>
</template>

<script setup lang="ts">
import BaseView from '@/components/templates/BaseView.vue';
// Other imports...
</script>

<style scoped>
/* View-specific styles */
</style>
```

## View Documentation

All views MUST have comprehensive documentation in HTML comments at the top, including:

- View name and brief description
- Features list
- Accessibility considerations

Example:

```vue
<!--
@component ProfileView
@description A page component that displays and allows editing of the user's profile information.

@features
- Displays user profile information (name, email, role)
- Allows uploading and changing profile picture
- Shows success/error messages for avatar upload
- Responsive design for different screen sizes

@accessibility
- Uses semantic HTML elements
- Proper heading hierarchy
- Keyboard accessible file upload
- Clear success/error messaging
-->
```

## View Styling

All views MUST follow these styling guidelines:

- Use BEM syntax for CSS classes (view-name__element--modifier)
- Use semantic variables from vars.css
- Use standardized spacing variables:
  - `--spacing-xs` (0.25rem)
  - `--spacing-sm` (0.5rem)
  - `--spacing-md` (1rem)
  - `--spacing-lg` (1.5rem)
  - `--spacing-xl` (2rem)
- NO px units for spacing (except media query breakpoints)
- NO inline styles or Tailwind classes
- All views MUST be responsive by default

## View Responsiveness

All views MUST be responsive by default, using these standard breakpoints:

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

Example:

```css
@media (min-width: 768px) {
  .view-name__element {
    /* Responsive styles */
  }
}
```

## View Error Handling

All views MUST handle error states consistently:

- Use the standard error component
- Provide clear error messages
- Offer a way to recover from errors

Example:

```vue
<div v-if="error" class="view-name__error">
  <p class="view-name__error-text">{{ error }}</p>
  <div class="view-name__actions">
    <AppButton @click="retryAction">Try Again</AppButton>
  </div>
</div>
```

## View Loading States

All views MUST handle loading states consistently:

- Use the standard loading component
- Provide clear loading indicators
- Ensure loading states are accessible to screen readers

Example:

```vue
<LoadingSpinner v-if="loading" size="lg" text="Loading..." />
```

## View TypeScript

All views MUST use TypeScript with proper typing:

- Use type-only imports for interfaces and types
- NO type imports mixed with value imports
- All functions MUST have explicit return types
- Interfaces MUST be used instead of type aliases for object shapes
- Exported constants and functions MUST have explicit type annotations

Example:

```typescript
import type { IUser } from '@/types/user';
import { ref, computed } from 'vue';

const user = ref<IUser | null>(null);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);

const fetchUser = async (): Promise<void> => {
  // Implementation
};
```

## View Testing

All views MUST have corresponding test files in the `__tests__` directory:

- Test files MUST be named `*.test.ts`
- Tests MUST cover all features and edge cases
- Tests MUST include accessibility testing
- Tests MUST verify responsive behavior
- Critical views MUST have 100% test coverage

## View Accessibility

All views MUST be accessible (WCAG 2.1 AA compliant):

- Use semantic HTML elements
- NO redundant ARIA attributes when semantic HTML would suffice
- ARIA attributes ONLY used when all required conditions are met
- Proper heading hierarchy MUST be maintained
- Keyboard navigation MUST be supported

## Decision Tree for View Implementation

When implementing a new view, follow these steps:

1. Use the BaseView component as a foundation
2. Add comprehensive documentation
3. Implement the view structure
4. Add view-specific styles using BEM syntax
5. Implement error and loading states
6. Ensure responsiveness
7. Add TypeScript typing
8. Write tests
9. Verify accessibility 