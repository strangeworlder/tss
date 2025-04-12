# Author Components Refactoring Plan

## Overview

The current structure of author components violates our atomic design principles by placing all author-related components in a single folder (`front/src/components/author/`) regardless of their complexity or purpose. This document outlines a comprehensive plan to refactor these components according to atomic design principles.

## Current Structure Issues

1. All author components are located in `front/src/components/author/` regardless of their complexity or purpose
2. Component categorization doesn't follow atomic design principles (atoms, molecules, organisms, templates, pages)
3. Some components are essentially page views but are mixed with UI components
4. Several components have potential for broader use but are tightly coupled to the author context
5. Import paths will need to be updated across the codebase

## Component Analysis and Categorization

Based on analysis of the components, here's how they should be categorized:

### Move to Views (Pages)
- `AuthorDashboard.vue` → `front/src/views/author/DashboardView.vue`
- `AuthorContentCreator.vue` → `front/src/views/author/ContentCreatorView.vue`
- `AuthorContentManagement.vue` → `front/src/views/author/ContentManagementView.vue`
- `AuthorSettings.vue` → `front/src/views/author/SettingsView.vue`
- `AuthorLogin.vue` → `front/src/views/author/LoginView.vue`

### Components to Generalize

Several components have functionality that could be useful across the application. These should be generalized:

1. **Calendar Component**
   - Current: `AuthorSchedulingCalendar.vue` (22KB, 783 lines)
   - Create generic: `front/src/components/organisms/calendar/SchedulingCalendar.vue`
   - Create author-specific extension: `front/src/components/organisms/author/AuthorCalendar.vue` (if needed)

2. **Content Statistics Component**
   - Current: `AuthorContentStatistics.vue` (7.9KB, 281 lines)
   - Create generic: `front/src/components/molecules/statistics/ContentStatistics.vue`
   - Create author-specific extension: `front/src/components/molecules/author/AuthorStatistics.vue` (if needed)

3. **Notification Component**
   - Current: `AuthorSchedulingNotifications.vue` (7.5KB, 285 lines)
   - Create generic: `front/src/components/molecules/notifications/NotificationList.vue`
   - Create author-specific extension: `front/src/components/molecules/author/AuthorNotifications.vue` (if needed)

4. **Status Component**
   - Current: `AuthorContentStatus.vue` (5.1KB, 209 lines)
   - Create generic: `front/src/components/atoms/status/StatusIndicator.vue`
   - Create author-specific extension: `front/src/components/molecules/author/ContentStatus.vue` (if needed)

5. **Dashboard Sidebar**
   - Current: `AuthorDashboardSidebar.vue` (2.6KB, 120 lines)
   - Generic implementation already exists: `front/src/components/organisms/Sidebar.vue`
   - Author-specific implementation: `front/src/components/organisms/author/AuthorSidebar.vue`

### Move to Organisms
- `AuthorContentList.vue` → `front/src/components/organisms/author/ContentList.vue`
- `AuthorSchedulingAnalytics.vue` → `front/src/components/organisms/author/SchedulingAnalytics.vue`
- `AuthorContentScheduler.vue` → `front/src/components/organisms/author/ContentScheduler.vue`

## Implementation Steps

### 1. Preparation

- [x] Create required directories if they don't exist:
  - `front/src/views/author/`
  - `front/src/components/organisms/author/`
  - `front/src/components/molecules/author/`
  - `front/src/components/organisms/calendar/`
  - `front/src/components/molecules/statistics/`
  - `front/src/components/molecules/notifications/`
  - `front/src/components/atoms/status/`
  - `front/src/components/organisms/navigation/`

### 2. Move View Components

- [x] Move `AuthorDashboard.vue` to `front/src/views/author/DashboardView.vue`
- [x] Move `AuthorContentCreator.vue` to `front/src/views/author/ContentCreatorView.vue`
- [x] Move `AuthorContentManagement.vue` to `front/src/views/author/ContentManagementView.vue`
- [x] Move `AuthorSettings.vue` to `front/src/views/author/SettingsView.vue`
- [x] Move `AuthorLogin.vue` to `front/src/views/author/LoginView.vue`

### 3. Create Generalized Components

- [x] Extract generic calendar functionality from `AuthorSchedulingCalendar.vue`:
  - [x] Create `front/src/components/organisms/calendar/SchedulingCalendar.vue`
  - [x] Create author-specific extension if needed
  - [x] Update imports and references

- [x] Extract generic statistics functionality from `AuthorContentStatistics.vue`:
  - [x] Create `front/src/components/molecules/statistics/ContentStatistics.vue`
  - [x] Create author-specific extension if needed
  - [x] Update imports and references

- [x] Extract generic notification functionality from `AuthorSchedulingNotifications.vue`:
  - [x] Create `front/src/components/molecules/notifications/NotificationList.vue`
  - [x] Create author-specific extension if needed
  - [x] Update imports and references

- [x] Extract generic status functionality from `AuthorContentStatus.vue`:
  - [x] Create `front/src/components/atoms/status/StatusIndicator.vue`
  - [x] Create author-specific extension if needed
  - [x] Update imports and references

- [x] Sidebar implementation:
  - [x] Generic sidebar already exists at `front/src/components/organisms/Sidebar.vue`
  - [x] Move `AuthorDashboardSidebar.vue` to `front/src/components/organisms/author/AuthorSidebar.vue`
  - [x] Update imports and references

### 4. Move Remaining Organism Components

- [x] Move `AuthorContentList.vue` to `front/src/components/organisms/author/ContentList.vue`
- [x] Move `AuthorSchedulingAnalytics.vue` to `front/src/components/organisms/author/SchedulingAnalytics.vue`
- [x] Move `AuthorContentScheduler.vue` to `front/src/components/organisms/author/ContentScheduler.vue`

### 5. Update Routes Configuration

- [x] Update route configuration in the router setup to reflect new view paths

### 6. Update Import Paths

- [x] Identify all files that import author components
- [x] Update import paths in those files to reflect new component locations
- [x] Check for dynamic imports that might be using these components
- [x] Move `authorAuth.ts` to `author.ts` in the stores directory
- [x] Update all imports of the author auth store

### 7. Update Component Names

- [x] Rename generalized components to remove domain-specific naming
- [x] Update component registration names in script sections
- [x] Update references in templates

### 8. Testing

- [x] Fix moved files that appear to be empty or incorrect:
  - [x] Delete empty AuthorSchedulingAnalytics.vue
  - [x] Delete empty AuthorContentList.vue
  - [x] Delete empty AuthorSettings.vue
  - [x] Ensure correct files are in place
- [x] Verify all components render correctly in their new locations
- [x] Test generalized components in multiple contexts to ensure they work properly
- [x] Check for broken links or missing imports
- [ ] Test navigation and functionality in the author section
- [ ] Verify that generalized components maintain all original functionality
- [ ] Run existing unit and E2E tests to ensure everything still works

### 9. Documentation

- [ ] Update component documentation to reflect new generalized nature where applicable
- [ ] Create usage examples for generalized components
- [ ] Update any documentation that references the old component paths
- [ ] Update component documentation comments to reflect new locations

### 10. Cleanup

- [ ] Remove the `front/src/components/author/` directory
- [ ] Verify there are no lingering references to old paths

## Timeline

- Estimated time for implementation: 5-7 days (increased from original 3-4 days due to component generalization)
- Suggested priority: High (affects application architecture)

## Risks and Mitigations

### Risks
- Breaking import paths could cause runtime errors
- Route configuration might need significant changes
- Component naming inconsistencies could be introduced
- Generalized components might not meet all use cases
- Increased complexity in component interfaces to support multiple contexts

### Mitigations
- Systematically update import paths using search and replace
- Test each route after updating configuration
- Review component names for consistency as part of the refactoring
- Make generalized components configurable with props and slots
- Add comprehensive tests for generalized components
- Create clear documentation on how to use generalized components
- Perform thorough manual testing after implementing changes

## Benefits of Component Generalization

1. **Improved Reusability**: Components can be used across different parts of the application
2. **Reduced Code Duplication**: Common functionality is implemented once
3. **Consistent User Experience**: Similar functionality looks and behaves consistently
4. **Easier Maintenance**: Fixes and improvements benefit all uses of the component
5. **Better Separation of Concerns**: Components focus on their core functionality rather than being tied to a specific domain 