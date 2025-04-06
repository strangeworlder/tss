# CommentForm Component Placement Rule

## Issue

We currently have two CommentForm components:
1. `front/src/components/molecules/CommentForm.vue`
2. `front/src/components/organisms/CommentForm.vue`

This violates our atomic design principles and creates confusion in the codebase.

## Analysis

The CommentForm component:
- Makes API calls to create comments
- Depends on global state management (auth store)
- Has complex validation logic
- Handles error states and notifications
- Represents a complete feature (comment creation)

## Decision

Based on our component architecture guidelines, the CommentForm component should be classified as an **organism** because:

1. It makes API calls (createComment)
2. It depends on global state management (auth store)
3. It has multiple responsibilities (form validation, API interaction, error handling)
4. It represents a complete feature (comment creation)

## Action Items

1. Remove the molecule version of CommentForm
2. Keep the organism version of CommentForm
3. Update all imports to reference the organism version
4. Ensure the organism version follows all component guidelines

## Implementation

1. Delete `front/src/components/molecules/CommentForm.vue`
2. Ensure `front/src/components/organisms/CommentForm.vue` has proper documentation and follows all guidelines
3. Update any imports in other components to reference the organism version

## Verification

After implementation:
1. Verify that all components that use CommentForm still work correctly
2. Verify that there are no duplicate CommentForm components
3. Verify that the organism version follows all component guidelines

## Prevention

To prevent similar issues in the future:
1. Always use the decision tree in the component architecture guidelines
2. Review existing components periodically to ensure they are in the correct category
3. When creating new components, explicitly decide their classification
4. Document the decision in the component's documentation 