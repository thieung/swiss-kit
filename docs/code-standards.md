# SwissKit - Code Standards & Guidelines

## Overview

This document outlines the coding standards, architectural patterns, and development guidelines for the SwissKit project. All contributors should follow these standards to maintain consistency and quality across the codebase.

## General Principles

### Code Philosophy
- **Clarity over cleverness**: Write code that is easy to understand
- **Consistency is key**: Follow established patterns throughout
- **Performance matters**: Optimize for user experience
- **Security first**: Consider security implications in all code
- **Testability**: Write code that is easy to test

### Development Workflow
1. **Feature First**: Understand requirements before coding
2. **Incremental**: Build and test in small increments
3. **Review**: All code changes require review
4. **Test**: Comprehensive testing before merging
5. **Document**: Update documentation with code changes

## TypeScript Standards

### Type Definitions

#### Interfaces vs Types
```typescript
// ✅ Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Use types for unions, primitives, or complex types
type Status = 'loading' | 'success' | 'error';
type ApiResponse<T> = {
  data: T;
  status: Status;
};
```

#### Strict Typing
```typescript
// ✅ Always specify return types
function formatSql(query: string): string {
  return query.trim();
}

// ✅ Use explicit typing for complex objects
const config: {
  theme: 'light' | 'dark';
  language: string;
  autoSave: boolean;
} = {
  theme: 'dark',
  language: 'sql',
  autoSave: true
};
```

#### Generics
```typescript
// ✅ Use generics for reusable components
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

class SqlRepository implements Repository<SqlQuery> {
  async findById(id: string): Promise<SqlQuery | null> {
    // Implementation
  }
}
```

### Error Handling

#### Custom Errors
```typescript
// ✅ Create specific error types
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ConversionError extends Error {
  constructor(
    message: string,
    public source: string,
    public target: string
  ) {
    super(message);
    this.name = 'ConversionError';
  }
}
```

#### Error Patterns
```typescript
// ✅ Use Result pattern for operations that can fail
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

function safeJsonParse<T>(json: string): Result<T> {
  try {
    const data = JSON.parse(json) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
```

## Svelte Standards

### shadcn-svelte Integration

#### Component Usage Guidelines

**Prerequisites**: Phase 01 migration completed - foundation is ready for Phase 02 component migration

**Configuration**:
- `components.json` configured with default style and slate theme
- Path aliases: `$lib/components/ui` for shadcn-svelte components
- Utility function: `cn()` from `src/lib/utils.ts` for conditional styling

**Component Import Patterns**:
```typescript
// ✅ Import from shadcn-svelte UI components
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';

// ✅ Use cn() for conditional styling
import { cn } from '$lib/utils';

// ✅ Proper component structure with shadcn-svelte components
<Card>
  <CardHeader>
    <CardTitle>Tool Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Input
      placeholder="Enter text"
      class={cn(
        "w-full",
        "focus:ring-2 focus:ring-blue-500",
        error && "border-red-500"
      )}
    />
    <Button variant="default" size="sm">
      Submit
    </Button>
  </CardContent>
</Card>
```

**Styling Integration**:
```typescript
// ✅ Use cn() to merge Tailwind classes safely
const buttonClass = cn(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  "transition-colors focus-visible:outline-none focus-visible:ring-2",
  "disabled:pointer-events-none disabled:opacity-50",
  {
    "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
    "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
    "text-red-600 hover:text-red-700": variant === "destructive"
  },
  className
);
```

**Component Organization**:
```typescript
// Phase 02 Migration Strategy - Ready for Implementation
src/lib/components/
├── ui/                    # shadcn-svelte components (Phase 02)
│   ├── button.svelte
│   ├── input.svelte
│   ├── card.svelte
│   ├── dialog.svelte
│   └── ...
├── common/                # Custom components (existing)
│   ├── Logo.svelte
│   ├── TextInput.svelte
│   └── ...
└── tools/                 # Tool-specific components
    ├── Base64Tool.svelte
    ├── SqlFormatterTool.svelte
    └── ...
```

**Theming with shadcn-svelte**:
```typescript
// ✅ Use CSS custom properties from app.css
<style>
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... other color tokens */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode color tokens */
  }
</style>

// ✅ Component usage with theme support
<Card class="bg-background text-foreground">
  <CardHeader>
    <CardTitle class="text-foreground">Themed Title</CardTitle>
  </CardHeader>
</Card>
```

**Error Handling with shadcn-svelte**:
```typescript
// ✅ Use shadcn-svelte components for error states
import { Alert, AlertDescription } from '$lib/components/ui/alert';

// Error display component
{#if error}
  <Alert variant="destructive">
    <AlertDescription>
      {error}
    </AlertDescription>
  </Alert>
{/if}
```

**Accessibility Standards**:
```typescript
// ✅ shadcn-svelte components include built-in accessibility
import { Button } from '$lib/components/ui/button';

<Button
  aria-label={ariaLabel}
  disabled={disabled}
  on:click={handleClick}
>
  {label}
</Button>

// ✅ Form components with proper labeling
import { Input, Label } from '$lib/components/ui';

<Label for="email">Email Address</Label>
<Input
  id="email"
  type="email"
  required
  aria-describedby="email-error"
  class={cn(error && "border-red-500")}
/>
{#if error}
  <span id="email-error" class="text-red-500 text-sm">
    {error}
  </span>
{/if}
```

### Component Structure

#### File Organization
```typescript
// ComponentName.svelte (Phase 02 Ready - will migrate to shadcn-svelte components)
<script lang="ts">
  // 1. Imports - will include shadcn-svelte components in Phase 02
  import type { ComponentType } from './types';
  import { createEventDispatcher } from 'svelte';
  // import { Button, Input } from '$lib/components/ui'; // Phase 02 migration
  import { cn } from '$lib/utils';

  // 2. Props and exports
  export let value: string = '';
  export let disabled: boolean = false;

  // 3. Reactive statements
  $: isValid = validateValue(value);

  // 4. Local state
  let internalValue = value;
  const dispatch = createEventDispatcher();

  // 5. Functions
  function validateValue(val: string): boolean {
    return val.length > 0;
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    internalValue = target.value;
    dispatch('change', { value: internalValue });
  }
</script>

<!-- Template (Current - will migrate in Phase 02) -->
<div class="component-wrapper">
  <input
    type="text"
    bind:value={internalValue}
    on:change={handleChange}
    disabled={disabled}
    class:invalid={!isValid}
  />
</div>

<!-- Template (Phase 02 Migration - shadcn-svelte components) -->
<!--
<Card class={cn("p-4", error && "border-red-500")}>
  <div class="space-y-2">
    <Label for={inputId}>Input Label</Label>
    <Input
      id={inputId}
      bind:value={internalValue}
      on:change={handleChange}
      disabled={disabled}
      class={cn(error && "border-red-500")}
    />
    {#if error}
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    {/if}
  </div>
</Card>
-->

<style>
  /* Component-specific styles (current implementation) */
  .component-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .invalid {
    border-color: var(--color-error);
  }

  /* Phase 02: Most styling will move to Tailwind classes via shadcn-svelte */
</style>
```

### Store Patterns

#### Custom Stores
```typescript
// stores/userStore.ts
import { writable, type Writable } from 'svelte/store';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

function createUserStore(): Writable<UserState> {
  const { subscribe, set, update } = writable<UserState>({
    currentUser: null,
    isLoading: false,
    error: null
  });

  return {
    subscribe,
    setUser: (user: User) => update(state => ({
      ...state,
      currentUser: user,
      error: null
    })),
    setLoading: (loading: boolean) => update(state => ({
      ...state,
      isLoading: loading
    })),
    setError: (error: string | null) => update(state => ({
      ...state,
      error,
      isLoading: false
    })),
    reset: () => set({
      currentUser: null,
      isLoading: false,
      error: null
    })
  };
}

export const userStore = createUserStore();
```

## Rust Standards

### Code Organization

#### Module Structure
```rust
// src/commands/sql_formatter.rs
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct FormatSqlRequest {
    pub query: String,
    pub dialect: SqlDialect,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FormatSqlResponse {
    pub formatted_query: String,
    pub syntax_errors: Vec<String>,
}

#[tauri::command]
pub async fn format_sql(
    request: FormatSqlRequest,
    state: State<'_, AppState>,
) -> Result<FormatSqlResponse, AppError> {
    // Implementation
    Ok(response)
}
```

#### Error Handling
```rust
// src/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Validation failed: {field} - {message}")]
    ValidationError { field: String, message: String },

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("SQL parsing error: {0}")]
    SqlParseError(String),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
```

### Performance Guidelines

#### Memory Management
```rust
// ✅ Use efficient data structures
use std::collections::HashMap;

// ✅ Prefer references over copies when possible
fn process_large_data(data: &[u8]) -> Result<ProcessedData, AppError> {
    // Work with references instead of copying
}

// ✅ Use String only when necessary
fn format_string(s: &str) -> String {
    format!("processed: {}", s)
}

// ✅ Consider using Cow for conditional ownership
use std::borrow::Cow;

fn maybe_transform(input: &str) -> Cow<'_, str> {
    if needs_transform(input) {
        Cow::Owned(transform(input))
    } else {
        Cow::Borrowed(input)
    }
}
```

## CSS & Styling Standards

### TailwindCSS Guidelines with shadcn-svelte

#### Component Styling
```css
/* ✅ Use utility classes for layout */
.sql-formatter {
  @apply flex flex-col gap-4 p-6 rounded-lg border border-gray-200;
}

.sql-formatter textarea {
  @apply w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.sql-formatter button {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed;
}

/* ✅ Phase 02: Use shadcn-svelte color tokens with Tailwind */
.sql-formatter {
  @apply flex flex-col gap-4 p-6 rounded-lg border bg-card text-card-foreground;
}

.sql-formatter button {
  @apply bg-primary text-primary-foreground hover:bg-primary/90
         disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Use shadcn-svelte CSS variables */
.sql-formatter textarea {
  border-color: hsl(var(--border));
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
}
```

#### Custom CSS Variables with shadcn-svelte
```css
/* src/app.css - shadcn-svelte color tokens (Phase 01 completed) */
@layer base {
  :root {
    /* shadcn-svelte color tokens */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;

    /* SwissKit custom colors */
    --color-primary: #3b82f6;
    --color-primary-dark: #1d4ed8;
    --color-secondary: #6b7280;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;

    /* Typography */
    --font-mono: 'Fira Code', Consolas, Monaco, monospace;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
  }

  .dark {
    /* shadcn-svelte dark mode tokens */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

#### Dark Mode Support
```css
/* Current implementation */
.dark {
  --color-primary: #60a5fa;
  --color-primary-dark: #3b82f6;
  --color-secondary: #9ca3af;
  --color-bg-primary: #1f2937;
  --color-bg-secondary: #374151;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
}

.dark .prose {
  color: var(--color-text-primary);
}

.dark .prose pre {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-bg-primary);
}

/* Phase 02: shadcn-svelte dark mode (tokens already defined above) */
.dark .shadcn-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

.dark .shadcn-button {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

## Testing Standards

### Unit Testing

#### Test Structure
```typescript
// tests/sql-formatter.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { formatSql } from '../src/lib/converters/sql-formatter';

describe('SQL Formatter', () => {
  describe('Basic Formatting', () => {
    it('should format simple SELECT query', () => {
      const input = 'SELECT id,name FROM users';
      const expected = 'SELECT\n  id,\n  name\nFROM users';

      expect(formatSql(input)).toBe(expected);
    });

    it('should handle empty input', () => {
      expect(formatSql('')).toBe('');
    });

    it('should handle whitespace-only input', () => {
      expect(formatSql('   \n\t  ')).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should throw ValidationError for null input', () => {
      expect(() => formatSql(null as any)).toThrow(ValidationError);
    });

    it('should handle malformed SQL gracefully', () => {
      const input = 'SELECT FROM WHERE';
      const result = formatSql(input);
      expect(result).toContain('syntax error');
    });
  });
});
```

#### Test Utilities
```typescript
// tests/test-utils.ts
export function createMockSqlQuery(overrides?: Partial<SqlQuery>): SqlQuery {
  return {
    id: 'test-id',
    query: 'SELECT * FROM users',
    language: 'sql',
    formatted: false,
    ...overrides
  };
}

export function expectSqlFormatting(input: string, expected: string) {
  expect(formatSql(input)).toBe(expected);
}
```

### Integration Testing

#### Component Testing
```typescript
// tests/SqlFormatter.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SqlFormatter from '../src/lib/tools/SqlFormatterTool.svelte';

describe('SqlFormatterTool', () => {
  it('should format SQL when button is clicked', async () => {
    render(SqlFormatter);

    const textarea = screen.getByLabelText('SQL Query');
    const button = screen.getByText('Format SQL');

    await fireEvent.input(textarea, { target: { value: 'SELECT id,name FROM users' } });
    await fireEvent.click(button);

    expect(textarea).toHaveValue('SELECT\n  id,\n  name\nFROM users');
  });

  it('should show error for invalid SQL', async () => {
    render(SqlFormatter);

    const textarea = screen.getByLabelText('SQL Query');
    const button = screen.getByText('Format SQL');

    await fireEvent.input(textarea, { target: { value: 'INVALID SQL' } });
    await fireEvent.click(button);

    expect(screen.getByText(/SQL syntax error/i)).toBeInTheDocument();
  });
});
```

## Documentation Standards

### Code Documentation

#### TypeScript JSDoc
```typescript
/**
 * Formats a SQL query according to specified dialect rules
 * @param query - The raw SQL query to format
 * @param options - Formatting options
 * @param options.dialect - SQL dialect to use for formatting
 * @param options.indentSize - Number of spaces for indentation
 * @returns Formatted SQL query string
 * @throws {ValidationError} When query is null or undefined
 * @throws {SqlParseError} When query contains syntax errors
 *
 * @example
 * ```typescript
 * const formatted = formatSql('SELECT id,name FROM users', {
 *   dialect: 'postgresql',
 *   indentSize: 2
 * });
 * console.log(formatted);
 * // Output: SELECT\n  id,\n  name\nFROM users
 * ```
 */
export function formatSql(
  query: string,
  options: FormatOptions = { dialect: 'postgresql', indentSize: 2 }
): string {
  // Implementation
}
```

#### Rust Documentation
```rust
/// Formats a SQL query according to the specified dialect and options.
///
/// # Arguments
///
/// * `query` - The raw SQL query string to format
/// * `options` - Configuration options for formatting behavior
///
/// # Returns
///
/// Returns a `Result` containing the formatted query string or an error
/// if the query cannot be parsed.
///
/// # Errors
///
/// * `AppError::ValidationError` - If the query is empty or null
/// * `AppError::SqlParseError` - If the query contains syntax errors
///
/// # Examples
///
/// ```
/// use swisskit::format_sql;
/// use swisskit::FormatOptions;
///
/// let options = FormatOptions::default().with_dialect(SqlDialect::PostgreSQL);
/// let formatted = format_sql("SELECT id,name FROM users", &options)?;
/// assert_eq!(formatted, "SELECT\n  id,\n  name\nFROM users");
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
pub fn format_sql(
    query: &str,
    options: &FormatOptions,
) -> Result<String, AppError> {
    // Implementation
}
```

## Performance Guidelines

### Frontend Performance

#### Bundle Optimization
```typescript
// ✅ Lazy load heavy components
const SqlFormatter = lazy(() => import('./tools/SqlFormatterTool.svelte'));
const MarkdownConverter = lazy(() => import('./tools/MarkdownConverterTool.svelte'));

// ✅ Dynamic imports for utilities
const formatSql = () => import('./converters/sql-formatter').then(m => m.formatSql);

// ✅ Tree-shake unused code
import { formatSql } from './converters/sql-formatter';
// Don't import everything if not needed
```

#### Memory Management
```typescript
// ✅ Cleanup event listeners
onDestroy(() => {
  window.removeEventListener('resize', handleResize);
});

// ✅ Dispose of resources
const dispose = store.subscribe(value => {
  // Handle subscription
});

onDestroy(() => {
  dispose();
});
```

### Backend Performance

#### Efficient Data Structures
```rust
// ✅ Use appropriate collections
use std::collections::{HashMap, HashSet};

// ✅ Avoid unnecessary allocations
fn process_items(items: &[Item]) -> Vec<ProcessedItem> {
    items.iter()
        .filter(|item| item.is_valid())
        .map(|item| item.process())
        .collect()
}
```

## Security Guidelines

### Input Validation
```typescript
// ✅ Validate all inputs
function validateSqlQuery(query: string): ValidationResult {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return { valid: false, error: 'Query too long' };
  }

  // Check for dangerous SQL patterns
  const dangerousPatterns = [
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /TRUNCATE/i,
    /EXEC\s*\(/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return { valid: false, error: 'Potentially dangerous SQL detected' };
    }
  }

  return { valid: true };
}
```

### Output Escaping
```typescript
// ✅ Escape user-generated content
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ✅ Use safe HTML rendering
import { escape } from 'html-escaper';

function renderCodeBlock(code: string, language: string): string {
  const escapedCode = escape(code);
  return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
}
```

## Git & Version Control

### Commit Messages
```
feat(components): add Prism.js syntax highlighting
fix(formatter): handle SQL comments correctly
docs(readme): update installation instructions
refactor(utils): extract common validation logic
test(formatter): add edge case tests
```

### Branch Naming
- `feature/sql-formatter` - New features
- `fix/memory-leak` - Bug fixes
- `docs/api-update` - Documentation updates
- `refactor/components` - Code refactoring
- `test/add-coverage` - Test improvements

## Code Review Guidelines

### Review Checklist
- [ ] Code follows project standards
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] Performance impact considered
- [ ] Security implications addressed
- [ ] Error handling is robust
- [ ] Accessibility requirements met

### Review Process
1. **Self-Review**: Author reviews own changes first
2. **Peer Review**: At least one other developer reviews
3. **Automated Checks**: CI/CD pipeline runs tests
4. **Approval**: Required approvals before merging
5. **Post-Merge**: Monitor for issues after deployment

## shadcn-svelte Migration Guidelines

### Phase 01: Foundation (Completed) ✅
- **Configuration**: `components.json` setup with default style and slate theme
- **Utilities**: `cn()` function for conditional class merging
- **TypeScript**: Path aliases configured for `$lib/components/ui`
- **Styling**: CSS custom properties integrated with existing TailwindCSS setup
- **Dependencies**: clsx, tailwind-merge, and icon packages added

### Phase 02: Component Migration (Ready) 🚀
- **Status**: Ready for implementation
- **Approach**: Migrate existing components to shadcn-svelte components
- **Priority**: High-use components first (buttons, inputs, cards, dialogs)
- **Strategy**: Maintain existing functionality while improving consistency

### Migration Checklist for Phase 02
- [ ] **Button Components**: Replace custom button implementations
- [ ] **Input Components**: Migrate text inputs, textareas, and form controls
- [ ] **Card Components**: Replace wrapper divs with shadcn-svelte Card
- [ ] **Dialog Components**: Migrate modal and alert implementations
- [ ] **Alert Components**: Replace custom error displays
- [ ] **Label Components**: Add proper form labeling
- [ ] **Form Components**: Migrate complex form interactions
- [ ] **Navigation**: Update sidebar and navigation components
- [ ] **Testing**: Update tests to work with shadcn-svelte components
- [ ] **Documentation**: Document migration progress and any customizations

### Integration Best Practices
```typescript
// ✅ Import and use shadcn-svelte components
import { Button, Input, Card, Alert } from '$lib/components/ui';

// ✅ Use cn() for conditional styling
import { cn } from '$lib/utils';

// ✅ Maintain accessibility standards
<Button
  aria-label={actionLabel}
  disabled={isLoading}
  variant={isDestructive ? "destructive" : "default"}
>
  {buttonText}
</Button>

// ✅ Handle form components properly
<Label for={inputId}>Field Label</Label>
<Input
  id={inputId}
  bind:value={formValue}
  class={cn(validationError && "border-red-500")}
  aria-describedby={`${inputId}-error`}
/>
{#if validationError}
  <Alert variant="destructive" id={`${inputId}-error`}>
    {validationError}
  </Alert>
{/if}
```

---

**Document Version**: 1.1
**Last Updated**: 2025-11-27
**Review Cycle**: Monthly
**Maintainers**: Development Team
**shadcn-svelte Status**: Phase 01 Completed, Phase 02 Ready