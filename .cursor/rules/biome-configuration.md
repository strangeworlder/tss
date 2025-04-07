# Biome Configuration Guidelines

## Overview

Biome is used in our project for linting and formatting TypeScript/JavaScript files. This document explains our Biome setup, usage guidelines, and best practices.

## Configuration

Our Biome configuration is defined in the root `biome.json` file, which includes:

- Formatting rules (indentation, line width, quote style, etc.)
- Linting rules for code quality and best practices
- Import organization settings

## Key Rules

1. **No Explicit Any**: Avoid using `any` type when possible. Use more specific types.
2. **Use Optional Chain**: Prefer `obj?.prop` over `obj && obj.prop`.
3. **Use For...Of**: Prefer `for...of` loops over `.forEach()` for better performance.
4. **No Template Literals for Simple Strings**: Use regular string literals when no interpolation is needed.
5. **Proper Parameter Types**: Avoid using `Function` type - use specific function signatures instead.

## Usage

### Running Biome

#### Frontend:
```bash
# Lint files with Biome
npm run lint:biome

# Format files with Biome
npm run format:biome
```

#### Backend:
```bash
# Lint files with Biome
npm run lint:biome

# Format files with Biome
npm run format:biome
```

### Pre-commit Hooks

Biome is integrated into our pre-commit hooks to ensure consistent code quality:

```bash
# Pre-commit runs both ESLint and Biome
./.husky/pre-commit
```

## VS Code Integration

Install the recommended VS Code extension:
- **Biome**: `biomejs.biome`

Configure VS Code to use Biome:
1. Enable format on save in your settings
2. Set Biome as the default formatter for JavaScript and TypeScript files

## Troubleshooting

When facing linting errors:

1. Review the error message to understand the issue
2. For parameter decorators in TypeScript files, comment out the decorator as:
   ```typescript
   async method(/* @Decorator() */ param: Type)
   ```
3. For non-null assertions, add explicit null checks instead:
   ```typescript
   // Instead of: process.env.SECRET!
   const secret = process.env.SECRET;
   if (!secret) {
     // Handle missing secret
   }
   ```
4. Run Biome with the `--unsafe` flag if you need to bypass certain checks temporarily

## Integration with Other Tools

Biome works alongside our existing tools:
- **ESLint**: For JavaScript/TypeScript specific rules
- **Prettier**: For code formatting
- **TypeScript**: For static type checking 