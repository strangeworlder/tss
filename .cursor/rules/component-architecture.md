# Component Architecture Guidelines

## Atomic Design Principles

Our component architecture follows atomic design principles, with clear boundaries between different levels of components:

### Atoms
- Basic building blocks of the UI
- Single, indivisible components with no dependencies on other components
- Examples: Button, Input, Avatar, Icon
- Characteristics:
  - No state management
  - No API calls
  - No complex logic
  - Pure presentational components
  - Highly reusable across the application

### Molecules
- Simple combinations of atoms
- Have a single, well-defined responsibility
- May have internal state but no complex state management
- Examples: SearchBar, FormField, AuthorInfo
- Characteristics:
  - Composed of one or more atoms
  - May have simple internal state (form validation, toggle state)
  - No API calls or complex data fetching
  - No dependency on global state management
  - Focused on a single UI pattern or interaction

### Organisms
- Complex UI components composed of molecules and atoms
- Have multiple responsibilities and complex interactions
- Often include API calls and state management
- Examples: CommentList, BlogPostCard, Navigation
- Characteristics:
  - Composed of multiple molecules and atoms
  - Complex state management (often using Pinia stores)
  - API calls and data fetching
  - Business logic and complex interactions
  - Often represent a complete feature or section of the UI

### Templates
- Page layouts that arrange organisms
- Define the structure of pages
- Examples: DefaultLayout, AuthLayout
- Characteristics:
  - Define the overall structure of pages
  - Arrange organisms in a specific layout
  - No direct API calls or complex state management
  - Focus on layout and structure

### Pages
- Complete pages composed of templates and organisms
- Represent specific routes in the application
- Examples: HomeView, BlogDetailView
- Characteristics:
  - Represent specific routes
  - Composed of templates and organisms
  - May include page-specific logic
  - Handle route parameters and navigation

## Clear Boundary Between Molecules and Organisms

The key distinction between molecules and organisms is:

**Molecules** are UI components that:
- Have a single, well-defined responsibility
- Are composed of atoms
- May have simple internal state
- Do not make API calls
- Do not depend on global state management
- Are focused on a specific UI pattern or interaction

**Organisms** are UI components that:
- Have multiple responsibilities
- Are composed of multiple molecules and atoms
- Include complex state management
- Make API calls
- Depend on global state management (Pinia stores)
- Represent a complete feature or section of the UI

### Decision Tree for Component Placement

When deciding whether a component should be a molecule or an organism, ask these questions:

1. Does the component make API calls? → Organism
2. Does the component depend on global state management (Pinia stores)? → Organism
3. Does the component have multiple, distinct responsibilities? → Organism
4. Does the component represent a complete feature or section of the UI? → Organism
5. Is the component composed of multiple molecules? → Organism
6. Does the component have complex interactions or business logic? → Organism

If the answer to any of these questions is "yes," the component should be an organism. Otherwise, it should be a molecule.

### Examples

**Molecules:**
- FormField: A single form field with validation
- AuthorInfo: Displays author information
- SearchBar: A search input with a button
- Pagination: Navigation controls for paginated content

**Organisms:**
- CommentList: Displays and manages a list of comments with API calls
- BlogPostCard: Displays a blog post with author info and interactions
- Navigation: Site navigation with authentication state
- CommentForm: A form for creating comments with API integration

## Component Naming Conventions

- Use PascalCase for component names
- Use kebab-case for component files
- Use BEM syntax for CSS classes
- Prefix interfaces with 'I' (IUser)
- Suffix enums with 'Enum' (StatusEnum)

## Component Documentation

All component documentation MUST be placed inside the component file (.vue) as an HTML comment at the top, including:
- Component name and brief description
- Features list
- Props table with types, defaults, and descriptions
- Events table with payload types and descriptions
- Accessibility considerations 

<!--
@component UserMenu
@description A dropdown menu component for user-related actions.

@features
- Displays user name with dropdown toggle
- Shows dropdown menu with profile link and logout button
- Handles open/close state
- Responsive design for mobile devices

@props
- userName: string - The name of the current user
- isOpen: boolean - Controls the open/closed state of the dropdown
- isProfileActive: boolean - Indicates if the profile page is currently active

@events
- toggle: Emitted when the dropdown toggle button is clicked
- logout: Emitted when the logout button is clicked

@accessibility
- Uses semantic HTML elements
- Provides aria-expanded attribute for screen readers
- Supports keyboard navigation
- Uses RouterLink for proper navigation
--> 