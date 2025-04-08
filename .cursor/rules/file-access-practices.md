# File Access Practices

## Rule: Use Direct File Access Tools Over Terminal Commands

When working with files in the codebase, always prefer using the direct file access tools provided by Cursor over terminal commands.

### Guidelines

1. **Use `read_file` tool instead of terminal commands**
   - ✅ CORRECT: Use `read_file` to view file contents
   - ❌ INCORRECT: Use `cat`, `less`, `more`, or other terminal commands to view files

2. **Use `list_dir` tool instead of terminal commands**
   - ✅ CORRECT: Use `list_dir` to list directory contents
   - ❌ INCORRECT: Use `ls`, `dir`, or other terminal commands to list directories

3. **Use `grep_search` tool instead of terminal commands**
   - ✅ CORRECT: Use `grep_search` to search for text patterns in files
   - ❌ INCORRECT: Use `grep`, `findstr`, or other terminal commands to search files

4. **Use `codebase_search` tool for semantic searches**
   - ✅ CORRECT: Use `codebase_search` for semantic code searches
   - ❌ INCORRECT: Use terminal-based search tools for semantic searches

### Rationale

- **Consistency**: Using the same tools throughout the codebase ensures consistent behavior
- **Integration**: Cursor's tools are designed to work with the IDE's features
- **Performance**: Direct file access is more efficient than spawning terminal processes
- **Reliability**: Terminal commands may behave differently across operating systems
- **Context awareness**: Cursor's tools maintain context about the codebase structure

### Exceptions

Terminal commands are appropriate when:
- Executing build or deployment scripts
- Running tests or linting tools
- Managing dependencies
- Interacting with version control systems
- Performing operations that don't have direct file access equivalents

### Examples

```typescript
// CORRECT: Using read_file tool
const fileContents = read_file('path/to/file.ts');

// INCORRECT: Using terminal command
const fileContents = run_terminal_cmd('cat path/to/file.ts');
```

```typescript
// CORRECT: Using list_dir tool
const directoryContents = list_dir('path/to/directory');

// INCORRECT: Using terminal command
const directoryContents = run_terminal_cmd('ls path/to/directory');
```

```typescript
// CORRECT: Using grep_search tool
const searchResults = grep_search('pattern', { include_pattern: '*.ts' });

// INCORRECT: Using terminal command
const searchResults = run_terminal_cmd('grep -r "pattern" --include="*.ts" .');
``` 