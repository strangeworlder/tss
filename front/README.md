# TSS Project Frontend

The frontend application for the TSS Project, built with Vue 3, TypeScript, and following BEM CSS methodology.

## Project Overview

This Vue-based frontend provides a responsive and accessible interface with:

- Blog post listing and detail views with Markdown rendering
- Admin interface for blog post management
- Newsletter signup
- Image optimization via the backend API
- CSS styling using BEM methodology and custom properties

## Project Structure

The frontend follows a modular architecture with clear separation of concerns:

```
front/
├── src/
│   ├── api/           # API client and services
│   ├── assets/        # Static assets and global styles
│   ├── components/    # Reusable UI components
│   │   ├── atoms/     # Basic building blocks
│   │   ├── molecules/ # Combinations of atoms
│   │   ├── organisms/ # Complex components
│   │   └── templates/ # Page layouts
│   ├── composables/   # Vue composition functions
│   ├── router/        # Vue Router configuration
│   ├── stores/        # Pinia state management
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── views/         # Route components
├── public/            # Static files
└── cypress/           # E2E tests
```

## CSS Architecture

### BEM Methodology

This project uses BEM (Block, Element, Modifier) syntax for all CSS classes:

- **Block**: The main component (e.g., `blog-detail-view`)
- **Element**: Parts of the block (e.g., `blog-detail-view__title`)
- **Modifier**: Variations of blocks or elements (e.g., `blog-detail-view__button--retry`)

All BEM segments use kebab-case: `my-block__my-element--my-modifier`

### CSS Variables

Global CSS variables are defined in `src/assets/vars.css` and include:

- Color palette
- Typography settings
- Layout measurements
- Animation timings
- Border radiuses
- Spacing units

Always reference these variables instead of hardcoding values.

## Component Architecture

- PascalCase for component names
- camelCase for variables, functions, and Vue methods
- Composition API with `<script setup>` pattern
- Atomic design principles for component organization
- Views directory for route components
- Components directory for reusable UI elements

## Development Setup

### Docker (Recommended)

The easiest way to run the frontend is using Docker:

```sh
# From the project root
docker-compose up frontend
```

The application will be available at http://localhost:8080

### Local Setup

```sh
# Install dependencies
npm install

# Run development server
npm run dev
```

The development server will be available at http://localhost:5173

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:e2e:dev` - Run E2E tests with Cypress in development mode
- `npm run test:e2e` - Run E2E tests against production build
- `npm run lint` - Run all linters
- `npm run format` - Format code with Prettier

## Key Features

- **Blog Post Views**: 
  - List view with pagination and filtering
  - Detail view with Markdown rendering and syntax highlighting
  - Responsive image handling
  - Author information and tags

- **Admin Interface**:
  - Blog post management
  - Create, edit, and delete posts
  - Real-time notifications
  - Tab-based navigation

- **Responsive Design**:
  - Mobile-first approach
  - Flexible layouts
  - Optimized images
  - Accessible components

- **Development Tools**:
  - TypeScript for type safety
  - ESLint and Prettier for code quality
  - Vitest for unit testing
  - Cypress for E2E testing
  - Vue DevTools integration
