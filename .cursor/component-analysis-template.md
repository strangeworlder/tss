# Component Analysis Template

## 0. CRITICAL: Component Location Check
- [ ] Component is in the correct atomic design directory (atoms, molecules, organisms, templates, pages)
- [ ] If not, it MUST be moved to the appropriate directory based on its complexity and responsibility
- [ ] Current location: [DIRECTORY]
- [ ] Recommended location: [RECOMMENDED_DIRECTORY]
- [ ] Reason for recommendation: [REASON]

## 1. Component Location & Atomic Design
- [ ] Component follows single responsibility principle appropriate for its atomic level
- [ ] Component complexity matches its atomic design classification
- [ ] Component dependencies align with its atomic level (atoms depend on nothing, molecules depend on atoms, etc.)

## 2. Documentation Requirements
- [ ] Component has comprehensive documentation in HTML comments at the top
- [ ] Documentation includes: name, description, features, props, events, accessibility
- [ ] No separate .md documentation files exist

## 3. TypeScript Compliance
- [ ] All imports follow type-only pattern for interfaces and types
- [ ] No type imports mixed with value imports
- [ ] All functions have explicit return types
- [ ] Interfaces used instead of type aliases for object shapes
- [ ] Exported constants and functions have explicit type annotations

## 4. Testing Requirements
- [ ] Component has corresponding test file in __tests__ directory
- [ ] Test file naming follows *.test.ts pattern
- [ ] Tests cover all props, events, and slots
- [ ] Tests include accessibility testing
- [ ] Tests cover error states and edge cases
- [ ] Tests verify responsive behavior
- [ ] Critical components have 100% test coverage

## 5. CSS & Styling Compliance
- [ ] All styling uses semantic variables from vars.css
- [ ] No hard-coded values used
- [ ] All spacing uses standardized rem-based variables (xs, sm, md, lg, xl)
- [ ] No px units used
- [ ] BEM syntax correctly applied
- [ ] No inline styles or Tailwind classes used

## 6. Accessibility Standards
- [ ] Semantic HTML elements used appropriately
- [ ] No redundant ARIA attributes when semantic HTML would suffice
- [ ] ARIA attributes only used when all required conditions are met:
  - [ ] Semantic HTML elements cannot provide the needed accessibility
  - [ ] The ARIA attribute serves a specific, necessary purpose
  - [ ] The attribute follows WAI-ARIA best practices
  - [ ] Comprehensive testing with screen readers has proven the need
- [ ] Proper heading hierarchy maintained
- [ ] Keyboard navigation supported

## 7. Component Structure
- [ ] Component follows Vue best practices
- [ ] Props have proper validation and default values
- [ ] Component is responsive by default
- [ ] Component is WCAG 2.1 AA compliant

## 8. File Organization & Imports
- [ ] Absolute imports use @/ prefix for project files
- [ ] Relative imports used appropriately
- [ ] All import paths are correct

## Issues Found
[List all issues found during analysis]

## Recommended Changes
[Provide specific code changes needed to bring the component into compliance] 