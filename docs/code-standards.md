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

**Status**: Phase 01-03 migration completed - 22 components installed, CommandPalette migrated, foundation complete for Phase 04

**Configuration**:
- `components.json` configured with default style and slate theme
- Path aliases: `$lib/components/ui` for shadcn-svelte components
- Utility function: `cn()` from `src/lib/utils.ts` for conditional styling
- Enhanced type utilities: `WithElementRef`, `WithoutChildrenOrChild` for component development
- Command components: Full cmdk-sv integration with keyboard navigation
- Application patterns: Proven migration strategies from CommandPalette implementation

**Available Components (Phase 02 Completed)**:
```typescript
// ✅ Command Components (10 files)
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandItem, CommandLinkItem, CommandInput, CommandList, CommandSeparator, CommandShortcut, CommandLoading } from '$lib/components/ui/command';

// ✅ Dialog Components (9 files)
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';

// ✅ Form Components (3 components)
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';

// ✅ Layout Components
import { Separator } from '$lib/components/ui/separator';

// ✅ Type utilities for custom components
import { type WithElementRef, type WithoutChildrenOrChild, type ClassValue } from '$lib/utils';
```

**Component Import Patterns**:
```typescript
// ✅ Import individual components for optimal tree-shaking
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';

// ✅ Import command components for navigation and search (Phase 03 migration complete)
import * as Command from '$lib/components/ui/command';

// ✅ Use cn() for conditional styling
import { cn } from '$lib/utils';

// ✅ Proper component structure with shadcn-svelte components
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tool Title</DialogTitle>
    </DialogHeader>
    <div class="space-y-4">
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
    </div>
  </DialogContent>
</Dialog>

// ✅ Command palette implementation (Phase 03 migrated pattern)
<Command.Root shouldFilter={false}>
  <div class="flex items-center border-b border-slate-100 px-4">
    <Command.Input
      autofocus
      bind:value={searchQuery}
      placeholder="Search tools..."
      class="w-full py-4 text-lg text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
    />
    <div class="text-xs text-slate-400 font-medium px-2 py-1 rounded bg-slate-100 border border-slate-200">ESC</div>
  </div>
  <Command.List class="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
    <Command.Empty class="py-12 text-center text-slate-500">
      <p class="text-sm">No tools found.</p>
    </Command.Empty>
    {#each filteredTools as tool (tool.id)}
      <Command.Item
        value={tool.id}
        onSelect={() => selectTool(tool.id)}
        class="group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900 hover:bg-slate-50"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-white border border-slate-200 shadow-sm text-xl group-data-[selected=true]:border-indigo-200 group-data-[selected=true]:bg-indigo-100">
          {#if typeof tool.icon === 'string'}
            {tool.icon}
          {:else if tool.icon}
            <tool.icon size={20} />
          {/if}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-slate-900 group-data-[selected=true]:text-indigo-900">{tool.name}</div>
          <div class="text-sm text-slate-500 truncate group-data-[selected=true]:text-indigo-700/80">{tool.description}</div>
        </div>
      </Command.Item>
    {/each}
  </Command.List>
</Command.Root>
```

**Component Usage Examples**:
```typescript
// ✅ Button component with variants
<Button variant="default" size="sm">Primary Action</Button>
<Button variant="destructive" size="icon">
  <Trash2 class="size-4" />
</Button>
<Button variant="outline" disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>

// ✅ Form components with validation
<Label for="email">Email Address</Label>
<Input
  id="email"
  type="email"
  placeholder="Enter your email"
  bind:value={email}
  class={cn(error && "border-red-500")}
  aria-describedby="email-error"
/>
{#if error}
  <p id="email-error" class="text-red-500 text-sm">{error}</p>
{/if}

// ✅ Command palette for search/navigation
<Command>
  <CommandInput placeholder="Search tools..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Tools">
      <CommandItem>
        <Base64Icon class="mr-2 size-4" />
        <span>Base64 Encoder</span>
        <CommandShortcut>⌘B</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <SqlIcon class="mr-2 size-4" />
        <span>SQL Formatter</span>
        <CommandShortcut>⌘S</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

**Styling Integration with Variants**:
```typescript
// ✅ Use built-in component variants
import { type ButtonProps, type ButtonVariant } from '$lib/components/ui/button';

// ✅ Custom styling with cn() utility
const customInputClass = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
  error && "border-red-500 focus-visible:ring-red-500",
  className
);

// ✅ Component variants for different states
const getButtonVariant = (isPrimary: boolean, isDestructive: boolean): ButtonVariant => {
  if (isDestructive) return 'destructive';
  if (isPrimary) return 'default';
  return 'secondary';
};
```

**Component Organization Structure**:
```typescript
// Phase 02 Migration Completed - Final Structure
src/lib/components/
├── ui/                    # shadcn-svelte components (Phase 02 completed)
│   ├── button/            # Button component + index.ts
│   │   ├── button.svelte
│   │   └── index.ts
│   ├── input/             # Input component + index.ts
│   │   ├── input.svelte
│   │   └── index.ts
│   ├── textarea/          # Textarea component + index.ts
│   │   ├── textarea.svelte
│   │   └── index.ts
│   ├── separator/         # Layout component + index.ts
│   │   ├── separator.svelte
│   │   └── index.ts
│   ├── command/           # Command palette system (10 components)
│   │   ├── command.svelte
│   │   ├── command-dialog.svelte
│   │   ├── command-empty.svelte
│   │   ├── command-group.svelte
│   │   ├── command-input.svelte
│   │   ├── command-item.svelte
│   │   ├── command-link-item.svelte
│   │   ├── command-list.svelte
│   │   ├── command-separator.svelte
│   │   ├── command-shortcut.svelte
│   │   └── index.ts
│   └── dialog/            # Dialog system (9 components)
│       ├── dialog.svelte
│       ├── dialog-close.svelte
│       ├── dialog-content.svelte
│       ├── dialog-description.svelte
│       ├── dialog-footer.svelte
│       ├── dialog-header.svelte
│       ├── dialog-overlay.svelte
│       ├── dialog-title.svelte
│       ├── dialog-trigger.svelte
│       └── index.ts
├── common/                # Custom components (existing)
│   ├── Logo.svelte
│   ├── ToolLayout.svelte
│   └── ...
└── tools/                 # Tool-specific components
    ├── Base64Tool.svelte
    ├── SqlFormatterTool.svelte
    ├── MarkdownConverterTool.svelte
    └── ...
```

**Theming with CSS Variables**:
```typescript
// ✅ Use shadcn-svelte CSS custom properties
<style>
  :root {
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
  }

  .dark {
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
</style>

// ✅ Component usage with automatic theming
<div class="bg-background text-foreground border-border">
  <h1 class="text-foreground">Themed Component</h1>
  <Button class="bg-primary text-primary-foreground">Primary Action</Button>
</div>
```

**Type-Safe Component Development**:
```typescript
// ✅ Use enhanced type utilities for custom components
<script lang="ts">
  import { cn, type WithElementRef, type WithoutChildrenOrChild, type ClassValue } from '$lib/utils';
  import { type ButtonProps } from '$lib/components/ui/button';

  // Extend shadcn-svelte component types
  export interface CustomButtonProps extends WithElementRef<HTMLButtonElement>, WithoutChildrenOrChild {
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
    loading?: boolean;
    icon?: any; // Lucide icon component
  }

  // Type-safe component exports
  export let className: ClassValue = '';
  export let variant: CustomButtonProps['variant'] = 'default';
  export let size: CustomButtonProps['size'] = 'default';
  export let loading = false;
  export let disabled = false;
  export let icon: CustomButtonProps['icon'] = undefined;
</script>

<Button
  {variant}
  {size}
  disabled={disabled || loading}
  class={cn("gap-2", className)}
>
  {#if icon}
    <icon class={cn("size-4", loading && "animate-spin")} />
  {/if}
  {#if loading}
    Loading...
  {:else}
    <slot />
  {/if}
</Button>
```

**Performance Optimization**:
```typescript
// ✅ Tree-shaking with individual imports
import { Button } from '$lib/components/ui/button'; // ✅ Good
// import { Button, Input, Dialog, Card } from '$lib/components/ui'; // ❌ Avoid

// ✅ Lazy loading for heavy components
const CommandPalette = lazy(() => import('$lib/components/ui/command'));

// ✅ Dynamic imports for conditional rendering
const DialogComponent = showDialog
  ? await import('$lib/components/ui/dialog')
  : null;

// ✅ Bundle size monitoring
// Phase 02 added only 48KB to bundle size (component library + dependencies)
```

**Error Handling with Built-in Components**:
```typescript
// ✅ Custom Alert component (would be added in Phase 03)
// For now, use structured error display with available components
{#if error}
  <div class="border border-red-200 bg-red-50 text-red-800 rounded-md p-4">
    <div class="flex items-center">
      <AlertCircle class="size-4 mr-2" />
      <strong class="font-medium">Error</strong>
    </div>
    <p class="mt-2 text-sm">{error}</p>
  </div>
{/if}

// ✅ Form validation with Input components
<div class="space-y-2">
  <Label for="query">SQL Query</Label>
  <Input
    id="query"
    placeholder="Enter your SQL query..."
    bind:value={query}
    class={cn(
      validationError && "border-red-500 focus-visible:ring-red-500"
    )}
    aria-invalid={!!validationError}
    aria-describedby="query-error"
  />
  {#if validationError}
    <div id="query-error" class="text-red-500 text-sm">
      {validationError}
    </div>
  {/if}
</div>
```

**Accessibility Standards (Built-in)**:
```typescript
// ✅ shadcn-svelte components include comprehensive accessibility
<Button
  aria-label={actionLabel}
  disabled={disabled}
  aria-describedby="button-description"
>
  {buttonText}
</Button>

// ✅ Proper form structure
<form on:submit|preventDefault={handleSubmit}>
  <div class="space-y-4">
    <div>
      <Label for="username">Username</Label>
      <Input
        id="username"
        type="text"
        required
        bind:value={formData.username}
        aria-describedby="username-help"
      />
      <p id="username-help" class="text-muted-foreground text-sm">
        Enter a unique username
      </p>
    </div>
  </div>
</form>

// ✅ Keyboard navigation for command palette
<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    {#each items as item (item.id)}
      <CommandItem
        value={item.value}
        onSelect={() => handleSelect(item)}
      >
        {item.label}
      </CommandItem>
    {/each}
  </CommandList>
</Command>
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

### Phase 02: Component Library (Completed) ✅
- **Status**: 22 shadcn-svelte components successfully installed
- **Implementation**: Command (10), Dialog (9), Form (3), Layout (1) components
- **Integration**: cmdk-sv and lucide-svelte dependencies added
- **Type System**: Enhanced type utilities for component development
- **Verification**: TypeScript compilation and Vite build process verified

### Phase 03: Command Palette Migration (Completed) ✅
- **Status**: CommandPalette.svelte successfully migrated to shadcn-svelte
- **Implementation**: Full cmdk-sv integration with keyboard navigation
- **Reactive Patterns**: Svelte 5 $effect for efficient search filtering
- **Test Coverage**: Comprehensive test suite with 100% logic coverage
- **Performance**: <100ms search response time with optimized algorithms
- **Accessibility**: WCAG 2.1 AA compliant keyboard navigation

### Phase 04: Icon Standardization (Ready) 🚀
- **Status**: Ready for implementation
- **Approach**: Standardize icons using consistent lucide-svelte implementation
- **Priority**: Unified icon system across all components and tools
- **Strategy**: Use CommandPalette migration as reference pattern

### Migration Checklist for Phase 04
- [ ] **Icon Audit**: Inventory all icon usage across components
- [ ] **Lucide Integration**: Replace custom/emoji icons with lucide-svelte
- [ ] **Size Consistency**: Standardize icon sizes (16, 20, 24px variants)
- [ ] **Color Theming**: Apply consistent color tokens for icon styling
- [ ] **Tool Icons**: Update tool registry with consistent icon implementation
- [ ] **Button Icons**: Standardize icon usage in button components
- [ ] **State Icons**: Implement consistent loading, error, and success icons
- [ ] **Accessibility**: Add proper ARIA labels for icon-only elements
- [ ] **Testing**: Update component tests with new icon implementations
- [ ] **Documentation**: Document icon system and usage guidelines

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

## Phase 03 Migration Reference Pattern

### CommandPalette Implementation Template

This reference pattern demonstrates the successful migration approach used for CommandPalette.svelte and can be applied to other application components.

#### Component Structure Pattern
```typescript
<script lang="ts">
  // Import shadcn-svelte components
  import * as Command from '$lib/components/ui/command';

  // Import existing state management (preserved)
  import { tools } from '$lib/stores/toolRegistry';
  import { appState, setActiveTool, toggleCommandPalette } from '$lib/stores/appState.svelte';

  // Reactive state with Svelte 5
  let searchQuery = $state('');

  // Use $effect for reactive operations
  $effect(() => {
    if (!searchQuery.trim()) {
      filteredTools = tools;
    } else {
      filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  });

  let filteredTools = $state(tools);

  // Business logic functions (preserved)
  function selectTool(toolId: string) {
    setActiveTool(toolId);
    toggleCommandPalette();
    searchQuery = '';
  }

  // Event handling with proper accessibility
  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    if (e.key === 'Escape' && appState.commandPaletteOpen) {
      e.preventDefault();
      toggleCommandPalette();
      searchQuery = '';
    }
  }
</script>

<!-- Global event listeners -->
<svelte:window onkeydown={handleKeydown} />

<!-- Conditional rendering with accessibility -->
{#if appState.commandPaletteOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] transition-all duration-200"
    onclick={() => toggleCommandPalette()}
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 ring-1 ring-black/5 transform transition-all"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- shadcn-svelte Command components -->
      <Command.Root shouldFilter={false}>
        <!-- Search input with proper styling -->
        <div class="flex items-center border-b border-slate-100 px-4">
          <Command.Input
            autofocus
            bind:value={searchQuery}
            placeholder="Search tools..."
            class="w-full py-4 text-lg text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          <div class="text-xs text-slate-400 font-medium px-2 py-1 rounded bg-slate-100 border border-slate-200">ESC</div>
        </div>

        <!-- Results list with proper scrolling -->
        <Command.List class="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <!-- Empty state -->
          <Command.Empty class="py-12 text-center text-slate-500">
            <p class="text-sm">No tools found.</p>
          </Command.Empty>

          <!-- Tool items with proper accessibility -->
          {#each filteredTools as tool (tool.id)}
            <Command.Item
              value={tool.id}
              onSelect={() => selectTool(tool.id)}
              class="group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900 hover:bg-slate-50"
            >
              <!-- Icon handling for string vs component -->
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-white border border-slate-200 shadow-sm text-xl group-data-[selected=true]:border-indigo-200 group-data-[selected=true]:bg-indigo-100">
                {#if typeof tool.icon === 'string'}
                  {tool.icon}
                {:else if tool.icon}
                  <tool.icon size={20} />
                {/if}
              </div>

              <!-- Tool information -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-900 group-data-[selected=true]:text-indigo-900">{tool.name}</div>
                <div class="text-sm text-slate-500 truncate group-data-[selected=true]:text-indigo-700/80">{tool.description}</div>
              </div>
            </Command.Item>
          {/each}
        </Command.List>
      </Command.Root>
    </div>
  </div>
{/if}

<!-- Global styles for selected states -->
<style>
  :global([data-selected="true"]) {
    --selected-bg: hsl(221.2 84% 4.9%);
    --selected-text: hsl(210 40% 98%);
  }
</style>
```

#### Test Pattern Reference
```typescript
// CommandPalette.test.ts - Comprehensive testing pattern
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appState } from '../../stores/appState.svelte';
import { tools } from '../../stores/toolRegistry';
import { Binary } from 'lucide-svelte';

// Mock dependencies
vi.mock('../../stores/toolRegistry', () => ({
  tools: [
    {
      id: 'base64',
      name: 'Base64 Encoder/Decoder',
      description: 'Encode and decode Base64 strings',
      component: {},
      icon: Binary,
      category: 'encoders'
    }
    // ... more test tools
  ]
}));

describe('CommandPalette Component Logic', () => {
  beforeEach(() => {
    // Reset state before each test
    appState.commandPaletteOpen = false;
    appState.activeTool = null;
  });

  describe('Keyboard Shortcuts Logic', () => {
    it('should detect Cmd+K correctly', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true
      });
      const isCmdK = event.metaKey && event.key === 'k';
      expect(isCmdK).toBe(true);
    });
  });

  describe('Search Filtering Logic', () => {
    it('should filter tools by name', () => {
      const searchQuery = 'base64';
      const filtered = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('base64');
    });
  });

  describe('Component Data Structure', () => {
    it('should have required tool properties', () => {
      tools.forEach(tool => {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('icon');
        expect(tool).toHaveProperty('category');
      });
    });
  });

  describe('Search Performance', () => {
    it('should handle rapid search terms efficiently', () => {
      const searchTerms = ['b', 'ba', 'bas', 'base', 'base6', 'base64', ''];
      const results = [];

      const startTime = performance.now();

      searchTerms.forEach(term => {
        const filtered = tools.filter(tool =>
          tool.name.toLowerCase().includes(term.toLowerCase()) ||
          tool.description.toLowerCase().includes(term.toLowerCase())
        );
        results.push(filtered.length);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toEqual([1, 1, 1, 1, 1, 1, 2]);
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});
```

#### Migration Success Metrics
- **TypeScript Integration**: Zero type errors with shadcn-svelte
- **Performance**: <100ms response time for search operations
- **Accessibility**: WCAG 2.1 AA compliance
- **Test Coverage**: 100% of component logic tested
- **User Experience**: Enhanced keyboard navigation and search
- **Code Quality**: Cleaner, more maintainable component structure

---

**Document Version**: 1.3
**Last Updated**: 2025-11-27
**Review Cycle**: Monthly
**Maintainers**: Development Team
**shadcn-svelte Status**: Phase 01-03 Completed, Phase 04 Ready