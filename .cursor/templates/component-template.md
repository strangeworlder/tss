# Component Creation Template

## Component Classification

Before creating a new component, determine its classification in the atomic design hierarchy:

### Is it an Atom?
- Basic UI element (button, input, icon)
- No dependencies on other components
- No state management
- No API calls
- Pure presentational

### Is it a Molecule?
- Single, well-defined responsibility
- Composed of atoms
- Simple internal state only
- No API calls
- No global state management
- Focused on a specific UI pattern

### Is it an Organism?
- Multiple responsibilities
- Composed of multiple molecules and atoms
- Complex state management
- API calls
- Global state management (Pinia stores)
- Represents a complete feature

### Decision Tree
1. Does it make API calls? → Organism
2. Does it depend on global state management? → Organism
3. Does it have multiple responsibilities? → Organism
4. Does it represent a complete feature? → Organism
5. Is it composed of multiple molecules? → Organism
6. Does it have complex interactions? → Organism

## Component Structure

```
front/src/components/[type]/[ComponentName].vue
```

Where `[type]` is one of:
- `atoms`: Basic UI elements
- `molecules`: Simple combinations of atoms
- `organisms`: Complex UI components
- `templates`: Page layouts
- `pages`: Complete pages

## Component Template

```vue
<!--
@component [ComponentName]
@description [Brief description of the component]

@features
- [Feature 1]
- [Feature 2]
- [Feature 3]

@props {
  [propName]: {
    type: [Type]
    required: [true/false]
    description: "[Description]"
  }
}

@events {
  [event-name]: {
    payload: [Type]
    description: "[Description]"
  }
}

@accessibility
- [Accessibility consideration 1]
- [Accessibility consideration 2]
-->

<template>
  <!-- Component template -->
</template>

<script setup lang="ts">
// Imports
import { ref, computed } from 'vue'
import type { IMyInterface } from '@/types/my-type'

// Props
interface Props {
  // Props definition
}

const props = withDefaults(defineProps<Props>(), {
  // Default values
})

// Emits
interface Emits {
  (e: 'event-name', payload: Type): void
}

const emit = defineEmits<Emits>()

// Component logic
</script>

<style scoped>
/* Component styles using BEM syntax */
</style>
```

## Test Template

```
front/src/components/[type]/__tests__/[ComponentName].test.ts
```

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import [ComponentName] from '../[ComponentName].vue'

// Mock dependencies
vi.mock('@/api/myService', () => ({
  myFunction: vi.fn()
}))

describe('[ComponentName]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount([ComponentName], {
      props: {
        // Props
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Additional tests
})
```

## Documentation Requirements

All components must include:
1. Component name and description
2. Features list
3. Props documentation
4. Events documentation
5. Accessibility considerations

## Accessibility Checklist

- [ ] Semantic HTML elements
- [ ] Proper heading hierarchy
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast (WCAG 2.1 AA)
- [ ] Focus management
- [ ] ARIA attributes (only when necessary) 