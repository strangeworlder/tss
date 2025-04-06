# Testing Standards

## Component Testing Structure

All component tests must follow the atomic design testing pattern, which includes:

1. **Main Test File**: `[ComponentName].test.ts`
   - Contains the actual test cases
   - Uses test utilities and fixtures for setup
   - Follows a consistent structure for test organization

2. **Test Utilities File**: `[ComponentName].test-utils.ts`
   - Contains helper functions for mounting components
   - Provides default props and overrides
   - Includes TypeScript interfaces for props

3. **Fixture File**: `__fixtures__/[ComponentName].fixture.ts`
   - Contains mock data for testing
   - Provides factory functions for creating test data
   - Organizes different test scenarios

## Test File Organization

```
front/src/components/[type]/__tests__/
├── [ComponentName].test.ts       # Main test file
├── [ComponentName].test-utils.ts # Test utilities
├── __fixtures__/                 # Fixtures directory
│   └── [ComponentName].fixture.ts # Component fixtures
├── __mocks__/                    # Mocks directory
├── integration/                  # Integration tests
└── unit/                         # Unit tests
```

## Avoiding Script Execution Issues

To avoid problems with running scripts:

1. **File Creation**: Create all necessary files directly through the editor rather than using terminal commands
2. **Directory Structure**: Ensure all required directories exist before creating files
3. **Import Paths**: Use relative paths for imports within the same directory
4. **File Naming**: Follow consistent naming conventions for all test-related files
5. **Error Handling**: Include proper error handling in test utilities

## Test Coverage Requirements

All components must have tests that cover:

1. **Rendering**
   - Default props rendering
   - All prop variations
   - Slot content rendering

2. **Props**
   - All prop types and validations
   - Default values
   - Required vs optional props

3. **Events**
   - All emitted events
   - Event payloads
   - Event modifiers

4. **User Interactions**
   - Click events
   - Keyboard events
   - Focus/blur events
   - Form events

5. **Accessibility**
   - ARIA attributes (when necessary)
   - Keyboard navigation
   - Focus management
   - Screen reader compatibility

6. **Styling**
   - CSS classes
   - Responsive behavior
   - Theme variations

7. **Edge Cases**
   - Error states
   - Loading states
   - Empty states
   - Boundary conditions

## Test Utility Pattern

All test utility files should follow this pattern:

```typescript
import { mount } from '@vue/test-utils'
import Component from '../Component.vue'
import { createComponentProps } from './__fixtures__/Component.fixture'

/**
 * Interface for Component props
 */
interface IComponentProps {
  // Define all props here
}

/**
 * Mounts the Component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountComponent(props: IComponentProps = createComponentProps()) {
  return mount(Component, {
    props,
    global: {
      // Global configuration
    }
  })
}

/**
 * Creates a default set of props for the Component
 * @param overrides - Props to override the defaults
 * @returns The props for the Component
 */
export function createDefaultComponentProps(overrides: Partial<IComponentProps> = {}) {
  return {
    // Default props
    ...overrides
  }
}
```

## Fixture Pattern

All fixture files should follow this pattern:

```typescript
/**
 * Creates a default set of props for the Component
 * @param overrides - Props to override the defaults
 * @returns The props for the Component
 */
export function createComponentProps(overrides: Record<string, any> = {}) {
  return {
    // Default props
    ...overrides
  }
}

/**
 * Mock data for testing the Component
 */
export const mockComponents = {
  default: createComponentProps(),
  // Additional test scenarios
}
```

## Test Case Organization

All test files should organize tests in the following order:

1. Rendering tests
2. Props tests
3. Events tests
4. User interaction tests
5. Accessibility tests
6. Styling tests
7. Edge case tests

## E2E Testing

For critical components, E2E tests should be created in addition to unit tests:

```
front/src/components/[type]/__tests__/[ComponentName].e2e.ts
```

## Integration Testing

For components that interact with other components or services, integration tests should be created:

```
front/src/components/[type]/__tests__/integration/[ComponentName].integration.ts
``` 