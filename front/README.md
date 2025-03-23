# Vue Blog Frontend

The frontend application for the Vue Blog, built with Vue 3, TypeScript, and following BEM CSS methodology.

## Project Overview

This Vue-based frontend provides a responsive and accessible blog interface with:

- Blog post listing and detail views
- Markdown rendering for post content
- Newsletter signup
- Image optimization via the backend API
- CSS styling using BEM methodology and custom properties

## CSS Architecture

### BEM Methodology

This project uses BEM (Block, Element, Modifier) syntax for all CSS classes:

- **Block**: The main component (e.g., `post-card`)
- **Element**: Parts of the block (e.g., `post-card__title`)
- **Modifier**: Variations of blocks or elements (e.g., `post-card--featured`)

All BEM segments use kebab-case: `my-block__my-element--my-modifier`

### CSS Variables

Global CSS variables are defined in `front/src/assets/vars.css` and include:

- Color palette
- Typography settings
- Layout measurements
- Animation timings

Always reference these variables instead of hardcoding values.

## Component Architecture

- PascalCase for component names
- camelCase for variables, functions, and Vue methods
- Composition API with `<script setup>` pattern

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) or [Cursor](https://cursor.sh/) with [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (disable Vetur).

## Project Setup

```sh
npm install
```

### Development Server

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with Vitest

```sh
npm run test:unit
```

### Run End-to-End Tests with Cypress

```sh
npm run test:e2e:dev
```

For production build testing:

```sh
npm run build
npm run test:e2e
```

### Linting and Formatting

```sh
# Run ESLint
npm run lint:eslint

# Run Oxlint
npm run lint:oxlint

# Run all linters
npm run lint

# Format code with Prettier
npm run format
```

## Key Features

- **Blog Post Cards**: Responsive cards showing post previews
- **Post Detail View**: Full blog post with Markdown rendering
- **Newsletter Component**: Email signup form
- **Responsive Navigation**: Works on all device sizes
- **Image Optimization**: Uses backend API for responsive images
