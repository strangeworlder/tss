# Vue Components Using Atomic Design

This project follows the Atomic Design methodology, which consists of five distinct levels of components:

## Structure

- **atoms/**: Basic building blocks - smallest, indivisible components
- **molecules/**: Groups of atoms functioning together as a unit
- **organisms/**: Complex components composed of molecules, atoms, and other organisms
- **templates/**: Page layouts without specific content
- **pages/**: Specific instances of templates with real content

## Guidelines

1. **Naming Convention**:
   - Use PascalCase for component names
   - Follow BEM methodology for CSS classes with kebab-case within BEM segments
   - Example: `.blog-post__author--featured`

2. **Component Creation**:
   - Keep components focused on a single responsibility
   - Use props for configuration
   - Emit events for parent communication
   - Use slots for content flexibility

3. **Styling**:
   - Use scoped CSS to prevent style leakage
   - Reference global variables from `assets/vars.css`
   - Never use inline styles
   - Never use Tailwind CSS classes

4. **TypeScript**:
   - Use TypeScript interfaces for props
   - Define prop types explicitly
   - Use enums for consistent values

5. **Testing**:
   - Test components in isolation
   - Mock dependencies when necessary
   - Test key functionality and user interactions

## Adding New Components

When adding a new component, consider where it fits in the atomic design hierarchy:

1. Is it a basic UI element that can't be broken down further? → **Atom**
2. Is it a group of atoms that form a functional unit? → **Molecule**
3. Is it a complex, distinct section of the interface? → **Organism**
4. Is it a page layout without specific content? → **Template**
5. Is it a specific instance of a template with real content? → **Page**

See the README in each subdirectory for more specific guidelines. 