# Component Architecture

This directory follows atomic design principles to organize UI components in a structured and maintainable way.

## Directory Structure

```
components/
├── atoms/         # Basic UI elements (buttons, inputs, icons)
├── molecules/     # Simple combinations of atoms
├── organisms/     # Complex UI components
├── templates/     # Page layouts
└── pages/         # Complete pages
```

## Component Classification

### Atoms

Basic building blocks of the UI:

- Single, indivisible components
- No dependencies on other components
- No state management
- No API calls
- Pure presentational components
- Examples: Button, Input, Avatar, Icon

### Molecules

Simple combinations of atoms:

- Single, well-defined responsibility
- Composed of atoms
- Simple internal state only
- No API calls
- No global state management
- Examples: FormField, AuthorInfo, SearchBar

### Organisms

Complex UI components:

- Multiple responsibilities
- Composed of multiple molecules and atoms
- Complex state management
- API calls
- Global state management (Pinia stores)
- Examples: CommentList, BlogPostCard, CommentForm

### Templates

Page layouts:

- Define the structure of pages
- Arrange organisms in a specific layout
- Examples: DefaultLayout, AuthLayout

### Pages

Complete pages:

- Represent specific routes
- Composed of templates and organisms
- Examples: HomeView, BlogDetailView

## Decision Tree for Component Placement

When deciding whether a component should be a molecule or an organism, ask these questions:

1. Does the component make API calls? → Organism
2. Does the component depend on global state management? → Organism
3. Does the component have multiple responsibilities? → Organism
4. Does the component represent a complete feature? → Organism
5. Is the component composed of multiple molecules? → Organism
6. Does the component have complex interactions? → Organism

If the answer to any of these questions is "yes," the component should be an organism. Otherwise, it should be a molecule.

## Component Guidelines

- Use PascalCase for component names
- Use kebab-case for component files
- Use BEM syntax for CSS classes
- Prefix interfaces with 'I' (IUser)
- Suffix enums with 'Enum' (StatusEnum)
- Document components with HTML comments at the top
- Include tests in `__tests__` directory
- Follow accessibility guidelines

## Documentation Requirements

All components must include:

1. Component name and description
2. Features list
3. Props documentation
4. Events documentation
5. Accessibility considerations

## Testing Requirements

- Every component MUST have unit tests
- Tests must cover all props, events, and slots
- Tests must verify accessibility features
- Tests must include error states and edge cases
- Tests must verify responsive behavior
- 100% coverage required for critical components
