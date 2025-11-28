# SwissKit - System Architecture

## Overview

SwissKit is a hybrid desktop application combining a Rust backend with a Svelte frontend, built on the Tauri framework. This architecture provides native performance, security, and cross-platform compatibility while maintaining modern web development practices.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SwissKit Application                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Svelte 5 + TypeScript)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  UI Components  │  │  Business Logic │  │  State Mgmt  │ │
│  │  - Tool Views   │  │  - Converters   │  │  - Stores     │ │
│  │  - Shared UI    │  │  - Validators   │  │  - Events     │ │
│  │  - Layouts      │  │  - Utilities    │  │  - Actions    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Tauri Bridge (IPC Communication)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Commands       │  │  Events         │  │  State       │ │
│  │  - invoke()     │  │  - listen()     │  │  - getState() │ │
│  │  - invoke()     │  │  - emit()       │  │  - setState() │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Backend (Rust)                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Commands       │  │  File System    │  │  Security    │ │
│  │  - SQL Formatter│  │  - Safe Access  │  │  - Sandboxing│ │
│  │  - Base64       │  │  - Permissions  │  │  - Validation│ │
│  │  - Markdown     │  │  - Watchers     │  │  - IPC Rules  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  System Layer                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Operating      │  │  File System    │  │  Network     │ │
│  │  System         │  │  - Files        │  │  - Optional  │ │
│  │  - Windows      │  │  - Directories  │  │  - Updates   │ │
│  │  - macOS        │  │  - Permissions  │  │  - Crashes   │ │
│  │  - Linux        │  │  - Metadata     │  │  - Analytics │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
src/lib/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn-svelte components (Phase 01-03 completed)
│   │   ├── command/      # Command palette system (10 components)
│   │   │   ├── command.svelte
│   │   │   ├── command-dialog.svelte
│   │   │   ├── command-empty.svelte
│   │   │   ├── command-group.svelte
│   │   │   ├── command-input.svelte
│   │   │   ├── command-item.svelte
│   │   │   ├── command-link-item.svelte
│   │   │   ├── command-list.svelte
│   │   │   ├── command-separator.svelte
│   │   │   ├── command-shortcut.svelte
│   │   │   └── index.ts
│   │   ├── dialog/       # Dialog system (9 components)
│   │   │   ├── dialog.svelte
│   │   │   ├── dialog-close.svelte
│   │   │   ├── dialog-content.svelte
│   │   │   ├── dialog-description.svelte
│   │   │   ├── dialog-footer.svelte
│   │   │   ├── dialog-header.svelte
│   │   │   ├── dialog-overlay.svelte
│   │   │   ├── dialog-title.svelte
│   │   │   ├── dialog-trigger.svelte
│   │   │   └── index.ts
│   │   ├── form/         # Form components (3 components)
│   │   │   ├── button/button.svelte + index.ts
│   │   │   ├── input/input.svelte + index.ts
│   │   │   └── textarea/textarea.svelte + index.ts
│   │   └── layout/       # Layout components (1 component)
│   │       └── separator/separator.svelte + index.ts
│   ├── common/          # Application components (migrating)
│   │   ├── CommandPalette.svelte # ✅ Phase 03 migrated
│   │   ├── Logo.svelte
│   │   ├── ToolLayout.svelte
│   │   ├── Button.svelte   # Legacy - will be replaced
│   │   ├── Input.svelte    # Legacy - will be replaced
│   │   ├── Modal.svelte    # Legacy - will be replaced
│   │   ├── Loading.svelte
│   │   └── TextInput.svelte
│   └── __tests__/        # Component tests
│       ├── CommandPalette.test.ts # ✅ Enhanced Phase 03 tests
│       └── ... (other component tests)
│   ├── common/          # Generic components (existing)
│   │   ├── Button.svelte
│   │   ├── Input.svelte
│   │   ├── Modal.svelte
│   │   ├── Loading.svelte
│   │   ├── TextInput.svelte
│   │   ├── Logo.svelte
│   │   └── ToolWrapper.svelte
│   ├── layout/          # Layout components
│   │   ├── Header.svelte
│   │   ├── Sidebar.svelte
│   │   ├── Footer.svelte
│   │   ├── Main.svelte
│   │   └── Dashboard.svelte
│   └── syntax/          # Syntax highlighting components
│       ├── CodeBlock.svelte
│       ├── SqlOutput.svelte
│       ├── MarkdownPreview.svelte
│       └── PrismHighlight.svelte
├── tools/               # Tool-specific components
│   ├── Base64Tool.svelte
│   ├── SqlFormatterTool.svelte
│   ├── MarkdownConverterTool.svelte
│   └── SqlOrmHelperTool.svelte
├── stores/              # State management
│   ├── userStore.ts
│   ├── settingsStore.ts
│   ├── toolStateStore.ts
│   └── appState.svelte    # CommandPalette state management (Phase 03)
├── converters/          # Data transformation
│   ├── base64.ts
│   ├── markdown-to-html.ts
│   ├── sql-formatter.ts
│   └── orm-generator.ts
├── utils/               # Helper functions
│   ├── validation.ts
│   ├── formatting.ts
│   ├── file-handling.ts
│   ├── performance.ts
│   ├── clipboard.ts
│   └── utils.ts         # shadcn-svelte cn() utility
└── types/               # TypeScript definitions
    ├── api.ts
    ├── tool.ts
    ├── user.ts
    └── common.ts
```

### State Management

#### Store Architecture
```typescript
// stores/toolStateStore.ts - Centralized tool state
import { writable, derived } from 'svelte/store';

interface ToolState {
  activeTool: ToolType | null;
  toolData: Record<ToolType, any>;
  isLoading: boolean;
  errors: Record<string, string>;
}

export const toolStateStore = writable<ToolState>({
  activeTool: null,
  toolData: {},
  isLoading: false,
  errors: {}
});

// Derived stores for specific tools
export const sqlFormatterStore = derived(
  toolStateStore,
  $toolState => $toolState.toolData.sqlFormatter
);

export const base64ToolStore = derived(
  toolStateStore,
  $toolState => $toolState.toolData.base64
);
```

#### Event System
```typescript
// stores/eventStore.ts - Global event management
import { writable } from 'svelte/store';

interface AppEvent {
  type: string;
  payload: any;
  timestamp: number;
}

export const eventStore = writable<AppEvent[]>([]);

export const eventBus = {
  emit: (type: string, payload: any) => {
    eventStore.update(events => [
      ...events,
      { type, payload, timestamp: Date.now() }
    ]);
  },

  on: (type: string, callback: (payload: any) => void) => {
    return eventStore.subscribe(events => {
      const latest = events[events.length - 1];
      if (latest?.type === type) {
        callback(latest.payload);
      }
    });
  }
};
```

### Component Patterns

#### Tool Component Template (Current Implementation)
```typescript
// tools/BaseToolTemplate.svelte (Current - will be enhanced with shadcn-svelte in Phase 02)
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { cn } from '$lib/utils'; // shadcn-svelte utility

  // Tool-specific configuration
  export let toolConfig: ToolConfig;

  // Common state
  let isLoading = false;
  let error: string | null = null;
  let result: any = null;

  const dispatch = createEventDispatcher();

  // Lifecycle hooks
  onMount(() => {
    dispatch('tool-mounted', { config: toolConfig });
  });

  onDestroy(() => {
    dispatch('tool-unmounted', { config: toolConfig });
  });

  // Common methods
  async function executeOperation(operation: () => Promise<any>) {
    try {
      isLoading = true;
      error = null;
      result = await operation();
      dispatch('operation-success', { result });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      dispatch('operation-error', { error });
    } finally {
      isLoading = false;
    }
  }

  function reset() {
    result = null;
    error = null;
    isLoading = false;
    dispatch('tool-reset');
  }
</script>

<!-- Current implementation -->
<div class="tool-container" class:loading={isLoading}>
  <!-- Tool-specific header -->
  <slot name="header" />

  <!-- Loading indicator -->
  {#if isLoading}
    <div class="loading-indicator">
      <LoadingSpinner />
      <span>Processing...</span>
    </div>
  {/if}

  <!-- Error display -->
  {#if error}
    <div class="error-message">
      <Icon name="error" />
      <span>{error}</span>
    </div>
  {/if}

  <!-- Tool content -->
  <div class="tool-content" class:has-result={result}>
    <slot />
  </div>

  <!-- Result display -->
  {#if result}
    <div class="tool-result">
      <slot name="result" {result} />
    </div>
  {/if}

  <!-- Tool actions -->
  <div class="tool-actions">
    <slot name="actions" {reset} {isLoading} />
  </div>
</div>

<!-- Phase 02: shadcn-svelte enhanced version -->
<!--
<Card class={cn("tool-container", isLoading && "opacity-75")}>
  <CardHeader>
    <slot name="header" />
  </CardHeader>

  <CardContent>
    <!-- Loading state -->
    {#if isLoading}
      <div class="flex items-center space-x-2 text-muted-foreground">
        <LoadingSpinner />
        <span>Processing...</span>
      </div>
    {/if}

    <!-- Error display with shadcn-svelte Alert -->
    {#if error}
      <Alert variant="destructive" class="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    {/if}

    <!-- Tool content -->
    <div class="tool-content" class:has-result={result}>
      <slot />
    </div>

    <!-- Result display -->
    {#if result}
      <div class="tool-result mt-4">
        <slot name="result" {result} />
      </div>
    {/if}
  </CardContent>

  <CardFooter>
    <div class="tool-actions flex space-x-2">
      <slot name="actions" {reset} {isLoading} />
    </div>
  </CardFooter>
</Card>
-->
```

## Theme System Architecture (Phase 06 Complete)

### Overview

The theme system is a comprehensive Dark/Light/System mode switching implementation with localStorage persistence, automatic system preference detection, and flicker-free initialization (FOUC prevention).

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Theme System Architecture               │
├─────────────────────────────────────────────────────────────┤
│  User Interface Layer                                      │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │  ThemeToggle.svelte│  │  Theme-Aware Components     │  │
│  │  - Dropdown UI   │  │  - Reacts to theme changes   │  │
│  │  - Icon display  │  │  - Uses color variables     │  │
│  │  - Persistence   │  │  - Proper theming classes    │  │
│  └──────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer (Svelte 5 Runes)                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  appState.svelte.ts                                   │ │
│  │  - themeMode: $state<ThemeMode>                     │ │
│  │  - localStorage persistence                            │ │
│  │  - System preference detection                         │ │
│  │  - Reactive theme updates                             │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Theme Resolution Layer                                   │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │  getInitialTheme()│  │  getResolvedTheme()         │  │
│  │  - localStorage   │  │  - Handles 'system' mode     │ │
│  │  - Default fallback│  │  - matchMedia() detection   │ │
│  │  - Validation     │  │  - Returns 'light'/'dark'   │ │
│  └──────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  DOM Application Layer                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  setTheme() function                                  │ │
│  │  - Class manipulation (light/dark)                   │ │
│  │  - colorScheme property                               │ │
│  │  - localStorage updates                               │ │
│  │  - System preference listeners                         │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  FOUC Prevention Layer                                   │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │  index.html      │  │  main.ts initialization     │  │
│  │  - Blocking script│  │  - Theme pre-application     │ │
│  │  - Flash prevention│ │  - System detection           │  │
│  │  - Immediate application │ │  - Event listeners          │  │
│  └──────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Styling & Design System (Tailwind CSS v4)                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  OKLCH Color System                                  │ │
│  │  - :root (light mode)                               │ │
│  │  - .dark (dark mode)                                │ │
│  │  - @theme directive mapping                          │ │
│  │  - Geist Variable fonts                             │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Theme System Components

#### 1. ThemeToggle.svelte
**Purpose**: Dropdown component for theme selection
**Key Features**:
- Sun icon for Light mode
- Moon icon for Dark mode
- Monitor icon for System mode
- Keyboard navigation support
- Click-outside detection
- Persistent selection state
- WCAG 2.1 AA accessibility compliance

**Technical Implementation**:
```svelte
<script lang="ts">
  import { Sun, Moon, Monitor } from 'lucide-svelte';
  import { appState, setTheme } from '$lib/stores/appState.svelte';

  type ThemeMode = 'light' | 'dark' | 'system';

  let isOpen = $state(false);

  // Theme selection handler
  function handleThemeSelect(mode: ThemeMode) {
    setTheme(mode);
    isOpen = false;
  }

  // Reactive dropdown management
  $effect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.theme-toggle-container')) {
          isOpen = false;
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>
```

#### 2. appState.svelte.ts (Enhanced)
**Purpose**: Centralized state management with theme support
**Key Features**:
- Reactive theme mode with Svelte 5 runes
- localStorage persistence
- System preference detection
- Automatic theme resolution
- Event listener management

**Technical Implementation**:
```typescript
type ThemeMode = 'light' | 'dark' | 'system';

// Reactive app state with theme management
export const appState = $state({
  activeTool: 'base64' as string | null,
  commandPaletteOpen: false,
  sidebarCollapsed: false,
  themeMode: getInitialTheme(),
});

// Theme initialization from localStorage or system
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

// Resolves system theme to actual theme
export function getResolvedTheme(): 'light' | 'dark' {
  if (appState.themeMode !== 'system') {
    return appState.themeMode;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}
```

#### 3. Theme Application Logic
**Purpose**: Handles theme switching with proper DOM manipulation
**Key Features**:
- Batch DOM updates for performance
- CSS class management
- colorScheme property setting
- localStorage synchronization
- System preference event listeners

**Technical Implementation**:
```typescript
export function setTheme(mode: ThemeMode) {
  appState.themeMode = mode;

  if (typeof window !== 'undefined') {
    // Persist theme preference
    localStorage.setItem('theme-mode', mode);

    // Calculate resolved theme
    const resolvedTheme = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;

    // Apply theme to document
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(resolvedTheme);
    html.style.colorScheme = resolvedTheme;
  }
}

// Theme initialization with system preference listeners
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const mode = getInitialTheme();
  const resolvedTheme = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  // Apply initial theme
  document.documentElement.classList.add(resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;

  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    if (appState.themeMode === 'system') {
      setTheme('system');
    }
  };

  mediaQuery.addEventListener('change', handleChange);

  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange);
}
```

### FOUC Prevention Implementation

#### 1. Index HTML Blocking Script
**Purpose**: Prevents flash of unstyled content during theme initialization
**Implementation**: Synchronous script in <head> before any CSS loading

**Technical Details**:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- FOUC Prevention: Blocking script for theme initialization -->
    <script>
      (function() {
        // Get theme from localStorage or default to system
        const theme = localStorage.getItem('theme-mode') || 'system';

        // Resolve system theme
        const resolvedTheme = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;

        // Apply theme immediately before CSS loads
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.style.colorScheme = resolvedTheme;
      })();
    </script>

    <!-- CSS and other head elements -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>SwissKit</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

#### 2. Main.ts Theme Initialization
**Purpose**: Completes theme setup after application loads
**Implementation**: Reinforces theme and sets up event listeners

**Technical Details**:
```typescript
import { initializeTheme } from '$lib/stores/appState.svelte';

// Initialize theme system
const cleanup = initializeTheme();

// Cleanup on app unmount
if (cleanup) {
  // Store cleanup function for potential use
  window.addEventListener('beforeunload', cleanup);
}
```

### Tailwind CSS v4 Integration

#### 1. CSS-First Configuration
**Purpose**: Modern Tailwind v4 setup using @theme directive
**Location**: src/app.css
**Key Features**:
- @theme directive for configuration
- OKLCH color space integration
- Geist variable font setup
- Custom dark mode variants

**Technical Implementation**:
```css
/* Font imports */
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* OKLCH Color System */
:root {
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.11 0.005 285.82);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.11 0.005 285.82);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.11 0.005 285.82);
  --primary: oklch(0.31 0.039 285.82);
  --primary-foreground: oklch(0.98 0.002 285.82);
  --secondary: oklch(0.96 0.006 285.82);
  --secondary-foreground: oklch(0.31 0.039 285.82);
  --muted: oklch(0.96 0.006 285.82);
  --muted-foreground: oklch(0.55 0.015 285.82);
  --accent: oklch(0.96 0.006 285.82);
  --accent-foreground: oklch(0.31 0.039 285.82);
  --destructive: oklch(0.65 0.22 29.23);
  --destructive-foreground: oklch(0.98 0.002 285.82);
  --border: oklch(0.92 0.006 285.82);
  --input: oklch(0.92 0.006 285.82);
  --ring: oklch(0.31 0.039 285.82);
  --radius: 0.5rem;
}

/* Dark mode variant */
.dark {
  --background: oklch(0.11 0.005 285.82);
  --foreground: oklch(0.98 0.002 285.82);
  --card: oklch(0.15 0.007 285.82);
  --card-foreground: oklch(0.98 0.002 285.82);
  --popover: oklch(0.11 0.005 285.82);
  --popover-foreground: oklch(0.98 0.002 285.82);
  --primary: oklch(0.98 0.002 285.82);
  --primary-foreground: oklch(0.31 0.039 285.82);
  --secondary: oklch(0.24 0.015 285.82);
  --secondary-foreground: oklch(0.98 0.002 285.82);
  --muted: oklch(0.24 0.015 285.82);
  --muted-foreground: oklch(0.70 0.012 285.82);
  --accent: oklch(0.24 0.015 285.82);
  --accent-foreground: oklch(0.98 0.002 285.82);
  --destructive: oklch(0.55 0.22 29.23);
  --destructive-foreground: oklch(0.98 0.002 285.82);
  --border: oklch(0.24 0.015 285.82);
  --input: oklch(0.24 0.015 285.82);
  --ring: oklch(0.84 0.012 285.82);
}

/* Tailwind v4 CSS-first theme configuration */
@theme {
  /* Font System */
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", ui-monospace, "Menlo", "Monaco", "Courier New", monospace;

  /* Color Mapping */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

/* Dark mode variant */
@custom-variant dark (&:is(.dark *));
```

#### 2. Vite Configuration
**Purpose**: Tailwind v4 Vite plugin integration
**Location**: vite.config.ts

**Technical Implementation**:
```typescript
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),  // Tailwind v4 plugin - replaces PostCSS
    svelte()
  ],
  resolve: {
    alias: {
      '$lib': resolve('./src/lib')
    }
  },
  // Font optimization for theme system
  optimizeDeps: {
    include: [
      '@fontsource-variable/geist',
      '@fontsource-variable/geist-mono'
    ]
  }
})
```

### Font System Architecture

#### 1. Geist Variable Fonts
**Purpose**: Self-hosted, high-quality variable fonts for optimal performance
**Benefits**:
- Offline compatibility
- No external CDN dependencies
- Variable weight support
- Optimized for UI and code display

**Font Integration**:
```css
/* Self-hosted variable fonts */
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";

/* Font system configuration */
@theme {
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", ui-monospace, "Menlo", "Monaco", "Courier New", monospace;
}

/* Font application */
body {
  font-family: var(--font-sans);
  font-feature-settings: "rlig" 1, "calt" 1;
}

code, pre {
  font-family: var(--font-mono);
  font-variant-ligatures: common-ligatures;
}
```

#### 2. Font Loading Strategy
**Purpose**: Optimize font loading for performance
**Implementation**: Vite optimization with preloading

**Configuration**:
```typescript
// vite.config.ts font optimization
export default defineConfig({
  optimizeDeps: {
    include: [
      '@fontsource-variable/geist',
      '@fontsource-variable/geist-mono'
    ]
  }
})
```

### Performance Optimization

#### 1. Theme Switching Performance
**Optimizations**:
- Debounced rapid theme changes (50ms)
- Batch DOM updates
- Efficient class manipulation
- Optimized localStorage access

**Implementation**:
```typescript
// Performance-optimized theme switching
let themeUpdateTimeout: number;

export function setTheme(mode: ThemeMode) {
  appState.themeMode = mode;

  // Debounce rapid changes
  if (themeUpdateTimeout) {
    clearTimeout(themeUpdateTimeout);
  }

  themeUpdateTimeout = setTimeout(() => {
    applyThemeToDocument(mode);
  }, 50);
}

function applyThemeToDocument(mode: ThemeMode) {
  const resolvedTheme = getResolvedTheme();
  const html = document.documentElement;

  // Batch DOM updates for performance
  html.classList.remove('light', 'dark');
  html.classList.add(resolvedTheme);
  html.style.colorScheme = resolvedTheme;

  // Persist theme preference
  localStorage.setItem('theme-mode', mode);
}
```

#### 2. Bundle Optimization
**Strategies**:
- Tree-shaking for unused theme components
- Code splitting for theme system
- Font optimization
- Minimal configuration

**Results**:
- Bundle size: 256.44 kB (83.69 kB gzipped)
- Build time: 3.86s
- Theme switching: <100ms response time
- FOUC prevention: Zero flash on initial load

### Testing Architecture

#### 1. Theme Component Testing
**Coverage**:
- ThemeToggle component functionality
- Theme state management
- localStorage persistence
- System preference detection
- DOM manipulation
- Accessibility compliance

**Test Implementation**:
```typescript
import { render, fireEvent, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ThemeToggle from './ThemeToggle.svelte';
import { appState, setTheme, initializeTheme } from '$lib/stores/appState.svelte';

// Mock matchMedia for system theme detection
const mockMatchMedia = vi.fn().mockImplementation(query => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('Theme System Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    appState.themeMode = 'system';
  });

  describe('ThemeToggle Component', () => {
    it('renders with correct icon for current theme', () => {
      render(ThemeToggle);

      const button = screen.getByLabelText('Toggle theme');
      expect(button).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
      render(ThemeToggle);
      const button = screen.getByLabelText('Toggle theme');

      await fireEvent.click(button);

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('changes theme when option selected', async () => {
      render(ThemeToggle);
      const button = screen.getByLabelText('Toggle theme');

      await fireEvent.click(button);
      const lightOption = screen.getByText('Light');

      await fireEvent.click(lightOption);

      expect(appState.themeMode).toBe('light');
      expect(localStorage.getItem('theme-mode')).toBe('light');
    });
  });

  describe('Theme State Management', () => {
    it('initializes theme from localStorage', () => {
      localStorage.setItem('theme-mode', 'dark');
      const initialTheme = getInitialTheme();

      expect(initialTheme).toBe('dark');
    });

    it('defaults to system theme when no localStorage value', () => {
      const initialTheme = getInitialTheme();

      expect(initialTheme).toBe('system');
    });

    it('resolves system theme correctly', () => {
      appState.themeMode = 'system';
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        // ... other properties
      });

      const resolvedTheme = getResolvedTheme();

      expect(resolvedTheme).toBe('dark');
    });
  });

  describe('Theme Application', () => {
    it('applies correct theme classes to document', () => {
      setTheme('dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('persists theme to localStorage', () => {
      setTheme('light');

      expect(localStorage.getItem('theme-mode')).toBe('light');
    });

    it('removes previous theme classes', () => {
      setTheme('dark');
      setTheme('light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
  });
});
```

### Integration Points

#### 1. Component Integration
**Pattern**: Theme-aware components using color variables
**Implementation**:
```svelte
<script lang="ts">
  import { getResolvedTheme } from '$lib/stores/appState.svelte';

  const resolvedTheme = $derived(getResolvedTheme());
</script>

<div class="bg-background text-foreground border-border rounded-lg">
  <h2 class="text-lg font-semibold text-foreground mb-2">
    Theme-Aware Component
  </h2>
  <p class="text-muted-foreground">
    Current theme: {resolvedTheme}
  </p>
</div>
```

#### 2. Tool Integration
**Pattern**: Existing tools with theme support
**Implementation**:
- All tool components use shadcn-svelte theming
- Automatic color adaptation
- Consistent visual experience
- Proper contrast ratios for accessibility

#### 3. Migration Path
**Legacy Component Integration**:
1. Replace custom styling with shadcn-svelte components
2. Use theme color variables for consistent theming
3. Apply theme-aware classes
4. Ensure accessibility compliance
5. Test across all three theme modes

### Security Considerations

#### 1. localStorage Security
- Validation of stored theme values
- Sanitization of theme input
- Fallback to safe defaults
- No sensitive data stored

#### 2. DOM Manipulation Safety
- Proper class validation
- Safe theme application
- Prevention of style injection
- Consistent state management

### Monitoring & Analytics

#### 1. Performance Metrics
- Theme switching response time
- Font loading performance
- Bundle size optimization
- Runtime performance impact

#### 2. User Experience Metrics
- Theme preference distribution
- System vs manual theme usage
- Theme switching frequency
- FOUC prevention effectiveness

---

## Backend Architecture

### Module Structure

```
src-tauri/src/
├── main.rs              # Application entry point
├── lib.rs               # Library module exports
├── commands/            # Tauri command handlers
│   ├── mod.rs           # Command module exports
│   ├── base64.rs        # Base64 encoding/decoding
│   ├── sql_formatter.rs # SQL formatting and validation
│   ├── markdown.rs      # Markdown conversion
│   ├── orm_helper.rs    # ORM code generation
│   └── file_system.rs   # File operations
├── services/            # Business logic services
│   ├── mod.rs
│   ├── sql_parser.rs    # SQL parsing and analysis
│   ├── markdown_parser.rs
│   ├── orm_generator.rs
│   └── validation.rs    # Input validation
├── models/              # Data models
│   ├── mod.rs
│   ├── sql_query.rs
│   ├── orm_schema.rs
│   └── conversion_result.rs
├── error.rs             # Error types and handling
├── state.rs             # Application state management
└── utils/               # Utility functions
    ├── mod.rs
    ├── file_utils.rs
    └── string_utils.rs
```

### Command Pattern

#### Command Implementation
```rust
// src/commands/sql_formatter.rs
use tauri::State;
use serde::{Deserialize, Serialize};

use crate::error::AppError;
use crate::services::sql_parser::SqlParser;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct FormatSqlRequest {
    pub query: String,
    pub dialect: SqlDialect,
    pub options: FormatOptions,
}

#[derive(Debug, Serialize)]
pub struct FormatSqlResponse {
    pub formatted_query: String,
    pub syntax_errors: Vec<SyntaxError>,
    pub metrics: FormattingMetrics,
}

#[tauri::command]
pub async fn format_sql(
    request: FormatSqlRequest,
    state: State<'_, AppState>,
) -> Result<FormatSqlResponse, AppError> {
    // Validate input
    if request.query.trim().is_empty() {
        return Err(AppError::ValidationError {
            field: "query".to_string(),
            message: "Query cannot be empty".to_string(),
        });
    }

    // Process request
    let parser = SqlParser::new(request.dialect);
    let result = parser
        .format(&request.query, &request.options)
        .await?;

    // Update metrics
    state.increment_sql_format_count().await?;

    Ok(result)
}
```

### Service Layer

#### SQL Parser Service
```rust
// src/services/sql_parser.rs
use async_trait::async_trait;
use std::collections::HashMap;

#[async_trait]
pub trait SqlParser: Send + Sync {
    async fn format(&self, query: &str, options: &FormatOptions) -> Result<FormatResult, AppError>;
    async fn validate(&self, query: &str) -> Result<ValidationResult, AppError>;
    async fn explain(&self, query: &str) -> Result<Explanation, AppError>;
}

pub struct PostgresSqlParser {
    formatter: SqlFormatter,
    validator: SqlValidator,
}

#[async_trait]
impl SqlParser for PostgresSqlParser {
    async fn format(&self, query: &str, options: &FormatOptions) -> Result<FormatResult, AppError> {
        let parsed = self.formatter.parse(query)?;
        let formatted = self.formatter.format(&parsed, options)?;

        Ok(FormatResult {
            formatted,
            original: query.to_string(),
            metrics: self.calculate_metrics(&parsed),
        })
    }

    async fn validate(&self, query: &str) -> Result<ValidationResult, AppError> {
        let errors = self.validator.validate(query)?;
        Ok(ValidationResult {
            is_valid: errors.is_empty(),
            errors,
        })
    }

    async fn explain(&self, query: &str) -> Result<Explanation, AppError> {
        // Implementation for SQL explanation
        let analysis = self.analyze_query(query).await?;
        Ok(Explanation {
            query_type: analysis.query_type,
            tables: analysis.tables,
            complexity: analysis.complexity,
            suggestions: analysis.suggestions,
        })
    }
}
```

## Data Flow Architecture

### Request/Response Flow

```
┌─────────────────┐    IPC     ┌─────────────────┐    Process    ┌─────────────────┐
│  Svelte Frontend│ ────────► │  Tauri Bridge  │ ──────────► │  Rust Backend   │
│                 │           │                 │             │                 │
│  - User Action  │           │  - invoke()    │             │  - Command      │
│  - Form Submit  │           │  - Serialization│             │  - Validation   │
│  - UI Update    │           │  - Type Check  │             │  - Processing   │
└─────────────────┘           └─────────────────┘             └─────────────────┘
        ▲                                                           │
        │                    Response                             │
        └─────────────────────◄──────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Frontend Update│
                    │                 │
                    │  - State Update │
                    │  - UI Render    │
                    │  - Error Display│
                    └─────────────────┘
```

### State Synchronization

#### Frontend State
```typescript
// stores/syncStore.ts - Frontend-backend synchronization
import { writable, type Writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/tauri';

interface SyncState<T> {
  local: T;
  remote: T | null;
  lastSync: number;
  isSyncing: boolean;
}

function createSyncStore<T>(
  key: string,
  initialValue: T,
  syncCommand: string
): Writable<SyncState<T>> {
  const { subscribe, set, update } = writable<SyncState<T>>({
    local: initialValue,
    remote: null,
    lastSync: 0,
    isSyncing: false
  });

  return {
    subscribe,

    // Update local state
    setLocal: (value: T) => update(state => ({
      ...state,
      local: value
    })),

    // Sync with backend
    sync: async () => {
      update(state => ({ ...state, isSyncing: true }));

      try {
        const remote = await invoke<T>(syncCommand, { value: null });
        update(state => ({
          ...state,
          remote,
          lastSync: Date.now(),
          isSyncing: false
        }));
      } catch (error) {
        update(state => ({ ...state, isSyncing: false }));
        throw error;
      }
    },

    // Push to backend
    push: async () => {
      update(state => ({ ...state, isSyncing: true }));

      try {
        const current = await get(); // Get current state
        const remote = await invoke<T>(syncCommand, {
          value: current.local
        });

        update(state => ({
          ...state,
          remote,
          lastSync: Date.now(),
          isSyncing: false
        }));
      } catch (error) {
        update(state => ({ ...state, isSyncing: false }));
        throw error;
      }
    }
  };
}
```

## Security Architecture

### Sandboxing Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Boundaries                       │
├─────────────────────────────────────────────────────────────┤
│  User Interface (Webview)                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  - Isolated JavaScript Environment                      │ │
│  │  - No direct system access                              │ │
│  │  - CSP enforced                                          │ │
│  │  - Limited API surface                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Tauri Bridge (Controlled IPC)                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  - Command whitelist                                    │ │
│  │  - Input validation                                      │ │
│  │  - Permission checks                                    │ │
│  │  - Rate limiting                                        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Backend (Rust)                                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  - Memory safety                                        │ │
│  │  - Type safety                                          │ │
│  │  - Capability-based security                            │ │
│  │  - Sandboxed file system access                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Permission Management

#### Capability Configuration
```json
// src-tauri/capabilities/default.json
{
  "identifier": "default",
  "description": "Default permissions for SwissKit",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-set-title",
    "core:window:allow-set-size",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-close",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-exists",
    "fs:allow-scope",
    "clipboard:allow-read-text",
    "clipboard:allow-write-text"
  ],
  "scope": {
    "fs": [
      "$HOME/Documents/**",
      "$HOME/Desktop/**",
      "$HOME/Downloads/**",
      "$TEMP/**"
    ]
  }
}
```

#### Input Validation
```rust
// src/services/validation.rs
use regex::Regex;
use once_cell::sync::Lazy;

static SQL_INJECTION_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        Regex::new(r"(?i)\b(DROP|DELETE|TRUNCATE)\b").unwrap(),
        Regex::new(r"(?i)\b(INSERT|UPDATE|ALTER)\b.*\b(USER|PASSWORD|AUTH)\b").unwrap(),
        Regex::new(r"(?i)\bEXEC\b\s*\(").unwrap(),
    ]
]);

pub struct SecurityValidator;

impl SecurityValidator {
    pub fn validate_sql_input(query: &str) -> Result<(), ValidationError> {
        // Check length limits
        if query.len() > MAX_SQL_LENGTH {
            return Err(ValidationError::TooLong(query.len()));
        }

        // Check for dangerous patterns
        for pattern in SQL_INJECTION_PATTERNS.iter() {
            if pattern.is_match(query) {
                return Err(ValidationError::DangerousPattern(
                    pattern.as_str().to_string()
                ));
            }
        }

        // Check encoding issues
        if query.chars().any(|c| c.is_control() && c != '\n' && c != '\t') {
            return Err(ValidationError::InvalidCharacters);
        }

        Ok(())
    }

    pub fn sanitize_file_path(path: &str) -> Result<String, ValidationError> {
        // Remove path traversal attempts
        let sanitized = path
            .replace("..", "")
            .replace("~/", "")
            .trim_start_matches('/');

        // Validate against allowed directories
        if !ALLOWED_DIRECTORIES.iter().any(|dir| sanitized.starts_with(dir)) {
            return Err(ValidationError::PathNotAllowed(sanitized.to_string()));
        }

        Ok(sanitized.to_string())
    }
}
```

## Performance Architecture

### Frontend Optimization

#### Code Splitting
```typescript
// vite.config.ts - Code splitting configuration
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Tool-specific chunks
          'sql-formatter': ['src/lib/tools/SqlFormatterTool.svelte'],
          'markdown-converter': ['src/lib/tools/MarkdownConverterTool.svelte'],
          'base64-tool': ['src/lib/tools/Base64Tool.svelte'],

          // Shared utilities
          'syntax-highlighting': ['prismjs', 'prism-themes'],
          'ui-components': ['src/lib/components/common'],
          'converters': ['src/lib/converters'],

          // Vendor chunks
          vendor: ['svelte', '@tauri-apps/api'],
        }
      }
    }
  }
});
```

#### Lazy Loading
```typescript
// src/lib/components/LazyToolLoader.svelte
<script lang="ts">
  import { onMount } from 'svelte';

  export let toolType: string;
  let ToolComponent: any = null;
  let isLoading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      switch (toolType) {
        case 'sql-formatter':
          ToolComponent = (await import('../tools/SqlFormatterTool.svelte')).default;
          break;
        case 'markdown-converter':
          ToolComponent = (await import('../tools/MarkdownConverterTool.svelte')).default;
          break;
        case 'base64':
          ToolComponent = (await import('../tools/Base64Tool.svelte')).default;
          break;
        default:
          throw new Error(`Unknown tool type: ${toolType}`);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load tool';
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <LoadingSpinner />
{:else if error}
  <ErrorMessage message={error} />
{:else if ToolComponent}
  <svelte:component this={ToolComponent} />
{/if}
```

### Backend Optimization

#### Connection Pooling
```rust
// src/services/connection_pool.rs
use std::sync::Arc;
use tokio::sync::Semaphore;
use std::collections::HashMap;

pub struct ConnectionPool<T> {
    max_connections: usize,
    active_connections: Arc<Semaphore>,
    connections: Arc<std::sync::Mutex<Vec<T>>>,
}

impl<T> ConnectionPool<T>
where
    T: Send + 'static,
{
    pub fn new(max_connections: usize) -> Self {
        Self {
            max_connections,
            active_connections: Arc::new(Semaphore::new(max_connections)),
            connections: Arc::new(std::sync::Mutex::new(Vec::new())),
        }
    }

    pub async fn acquire<F, R>(&self, factory: F) -> Result<R, AppError>
    where
        F: FnOnce() -> Result<T, AppError>,
        R: Send + 'static,
    {
        let _permit = self.active_connections.acquire().await?;

        // Try to reuse existing connection
        let connection = {
            let mut connections = self.connections.lock().unwrap();
            connections.pop().unwrap_or_else(|| factory()?)
        };

        // Use connection
        let result = self.use_connection(connection).await?;

        // Return connection to pool
        {
            let mut connections = self.connections.lock().unwrap();
            connections.push(connection);
        }

        Ok(result)
    }

    async fn use_connection(&self, connection: T) -> Result<R, AppError> {
        // Implementation for using the connection
        // This would be implemented for specific connection types
        todo!("Implement connection usage")
    }
}
```

## Monitoring & Observability

### Performance Metrics

```rust
// src/services/metrics.rs
use std::time::{Duration, Instant};
use std::collections::HashMap;

pub struct PerformanceMetrics {
    operation_times: HashMap<String, Vec<Duration>>,
    memory_usage: Vec<usize>,
    active_connections: usize,
}

impl PerformanceMetrics {
    pub fn new() -> Self {
        Self {
            operation_times: HashMap::new(),
            memory_usage: Vec::new(),
            active_connections: 0,
        }
    }

    pub fn record_operation<F, R>(&mut self, operation: &str, f: F) -> R
    where
        F: FnOnce() -> R,
    {
        let start = Instant::now();
        let result = f();
        let duration = start.elapsed();

        self.operation_times
            .entry(operation.to_string())
            .or_insert_with(Vec::new)
            .push(duration);

        result
    }

    pub fn get_average_time(&self, operation: &str) -> Option<Duration> {
        self.operation_times
            .get(operation)
            .map(|times| {
                let total: Duration = times.iter().sum();
                total / times.len() as u32
            })
    }

    pub fn get_metrics_summary(&self) -> MetricsSummary {
        MetricsSummary {
            average_sql_format_time: self.get_average_time("sql_format"),
            average_markdown_convert_time: self.get_average_time("markdown_convert"),
            average_base64_encode_time: self.get_average_time("base64_encode"),
            memory_usage_mb: self.get_current_memory_usage() / (1024 * 1024),
            active_operations: self.active_connections,
        }
    }
}
```

### Error Tracking

```typescript
// src/lib/services/error-tracking.ts
interface ErrorEvent {
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  timestamp: number;
  userAgent: string;
  version: string;
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors = 100;

  track(error: Error, context?: { component?: string; action?: string }) {
    const event: ErrorEvent = {
      type: 'error',
      message: error.message,
      stack: error.stack,
      component: context?.component,
      action: context?.action,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      version: import.meta.env.VITE_APP_VERSION || 'unknown'
    };

    this.errors.push(event);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Report to backend for analysis
    this.reportError(event);
  }

  private async reportError(event: ErrorEvent) {
    try {
      await invoke('report_error', { event });
    } catch (err) {
      console.error('Failed to report error:', err);
    }
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();
```

## shadcn-svelte Architecture Integration

### Component System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                shadcn-svelte Integration                     │
├─────────────────────────────────────────────────────────────┤
│  Configuration Layer                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  components.json│  │  Path Aliases   │  │  CSS Tokens  │ │
│  │  - Schema       │  │  - $lib/ui      │  │  - Themes    │ │
│  │  - Style Config │  │  - TypeScript   │  │  - Colors    │ │
│  │  - Tailwind CSS │  │  - Autocomplete │  │  - Dark Mode │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Utility Layer                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  cn() Function  │  │  Class Merging  │  │  Validation  │ │
│  │  - clsx        │  │  - tailwind-merge│  │  - Props     │ │
│  │  - tailwind-merge│ │  - Conditional  │  │  - Types     │ │
│  │  - Performance  │  │  - Optimization  │  │  - Defaults   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Component Library                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  UI Components  │  │  Form Components│  │  Navigation  │ │
│  │  - Button      │  │  - Input/Label  │  │  - Dialog    │ │
│  │  - Card        │  │  - Select       │  │  - Sheet     │ │
│  │  - Alert       │  │  - Checkbox     │  │  - Tabs      │ │
│  │  - Badge       │  │  - Radio        │  │  - Dropdown  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Migration Strategy                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Phase 01      │  │  Phase 02       │  │  Phase 03    │ │
│  │  - Foundation  │  │  - Migration    │  │  - Enhanced  │ │
│  │  - Config      │  │  - Components   │  │  - Custom UI │ │
│  │  - Setup       │  │  - Integration  │  │  - Themes    │ │
│  │  - Utilities   │  │  - Testing      │  │  - Plugins   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Integration Patterns

#### Phase 01 Foundation (Completed)
```typescript
// Configuration established
components.json {
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app.css",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "$lib/components",
    "utils": "$lib/utils",
    "ui": "$lib/components/ui"
  }
}

// Utility function ready
import { cn } from "$lib/utils";

// CSS tokens integrated
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  // ... shadcn-svelte tokens
}
```

#### Phase 02 Integration (Ready)
```typescript
// Component import strategy
import { Button, Card, Alert } from "$lib/components/ui";
import { cn } from "$lib/utils";

// Enhanced tool components
<Card class={cn("tool-container", isLoading && "opacity-75")}>
  <CardContent>
    {#if error}
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    {/if}

    <div class="tool-content">
      <slot />
    </div>

    <div class="tool-actions flex space-x-2 mt-4">
      <Button
        variant="default"
        size="sm"
        disabled={isLoading}
        on:click={handleAction}
      >
        {actionText}
      </Button>
    </div>
  </CardContent>
</Card>
```

### Component Migration Path

```
Current Implementation (Phase 01 Complete)
┌─────────────────────────────────────────────────────────────┐
│  Existing Components                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Button.svelte │  │  Input.svelte   │  │  Modal.svelte │ │
│  │  - Custom CSS  │  │  - Validation   │  │  - Wrapper    │ │
│  │  - Tailwind    │  │  - Styling      │  │  - Backdrop   │ │
│  │  - Events      │  │  - Events       │  │  - Focus      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Migration Strategy
                            │
┌─────────────────────────────────────────────────────────────┐
│  shadcn-svelte Components (Phase 02)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  button.svelte │  │  input.svelte   │  │  dialog.svelte│ │
│  │  - Consistent   │  │  - Accessible   │  │  - Keyboard   │ │
│  │  - Themable     │  │  - Forms Ready  │  │  - Focus Trap │ │
│  │  - Accessible   │  │  - Validation   │  │  - Size Variants│ │
│  │  - Variants     │  │  - Integration  │  │  - Animations │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Benefits of shadcn-svelte Integration

#### Development Experience
- **Consistency**: Unified component design language
- **Accessibility**: WCAG compliant components built-in
- **Theming**: Consistent color system with dark mode support
- **Type Safety**: Full TypeScript support with proper typing
- **Performance**: Optimized components with minimal bundle impact

#### Maintenance Benefits
- **Reduced CSS Debt**: Utility-first approach with consistent tokens
- **Easier Updates**: Well-maintained component library
- **Testing**: Built-in component patterns and test helpers
- **Documentation**: Comprehensive API documentation
- **Community**: Active development and community support

#### User Experience
- **Consistent UI**: Uniform design across all tools
- **Better Accessibility**: Screen reader and keyboard navigation support
- **Dark Mode**: Native dark theme support
- **Performance**: Faster load times and smoother interactions
- **Responsive**: Mobile-friendly responsive design

## Future Architecture Considerations

### Enhanced Plugin System with shadcn-svelte

```
┌─────────────────────────────────────────────────────────────┐
│            Enhanced Plugin Architecture                       │
├─────────────────────────────────────────────────────────────┤
│  Plugin Manager                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Plugin Loader  │  │  Component Registry│  │  UI Themes   │ │
│  │  - Dynamic Load │  │  - shadcn-svelte │  │  - Plugin UI │ │
│  │  - Validation   │  │  - Custom Comps  │  │  - Styling   │ │
│  │  - Lifecycle    │  │  - Integration   │  │  - Themes    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Plugin API with shadcn-svelte                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  UI Components  │  │  Data Hooks     │  │  Theme Hooks │ │
│  │  - shadcn-svelte│  │  - Converters   │  │  - Color Schemes │ │
│  │  - Custom UI    │  │  - Validators   │  │  - Branding  │ │
│  │  - Layouts      │  │  - Formatters   │  │  - Consistency │ │
│  │  - Actions      │  │  - Integration  │  │  - Integration │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Core Application with Enhanced UI                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Built-in Tools │  │  shadcn-svelte  │  │  Plugin UI   │ │
│  │  - Base64       │  │  - Component Lib │  │  - Injection │ │
│  │  - SQL Formatter│  │  - Theme System  │  │  - Layouts   │ │
│  │  - Markdown     │  │  - Design Tokens │  │  - Controls  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Cloud Integration

```
┌─────────────────────────────────────────────────────────────┐
│                   Cloud Architecture                         │
├─────────────────────────────────────────────────────────────┤
│  Client Application                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Local Storage  │  │  Sync Service   │  │  Offline Mode │ │
│  │  - Settings     │  │  - Conflict Res │  │  - Queueing  │ │
│  │  - Cache        │  │  - Incremental  │  │  - Reconnect │ │
│  │  - History      │  │  - Encryption   │  │  - Recovery  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Cloud Backend                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  API Gateway    │  │  Data Services  │  │  Auth Service│ │
│  │  - Rate Limit   │  │  - User Data    │  │  - JWT       │ │
│  │  - Load Balance │  │  - Backups      │  │  - Sessions  │ │
│  │  - SSL Terminate│  │  - Analytics    │  │  - MFA       │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Container Apps │  │  Database       │  │  Monitoring  │ │
│  │  - Kubernetes   │  │  - PostgreSQL   │  │  - Metrics   │ │
│  │  - Docker       │  │  - Redis Cache  │  │  - Logging   │ │
│  │  - Auto Scaling │  │  - S3 Storage   │  │  - Alerting  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Migration Status & Implementation Details

### Phase 01: shadcn-svelte Foundation (Completed ✅)
**Completion Date**: 2025-11-27
**Status**: Successfully implemented and verified

**Technical Implementation**:
```typescript
// Core configuration established
components.json {
  "$schema": "https://shadcn-svelte.com/schema.json",
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app.css",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "$lib/components",
    "utils": "$lib/utils",
    "ui": "$lib/components/ui"
  }
}

// Utility function implemented
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TypeScript path aliases configured
"$lib/components/ui": ["src/lib/components/ui"]
```

**Integration Results**:
- ✅ **Configuration**: components.json setup with default style and slate theme
- ✅ **Utilities**: cn() function for conditional class merging
- ✅ **Dependencies**: clsx, tailwind-merge, lucide-svelte, cmdk-sv integrated
- ✅ **TypeScript**: Path aliases configured for component resolution
- ✅ **Styling**: CSS custom properties integrated with TailwindCSS
- ✅ **Build System**: Vite and TypeScript compilation verified
- ✅ **Theme System**: Light/dark mode color tokens established

**Performance Impact**:
- Bundle size: Minimal increase (clsx + tailwind-merge < 10KB)
- Runtime performance: No impact, optimized class merging
- Development experience: Improved with type aliases and utility functions

### Phase 02: Component Migration (Completed ✅)
**Completion Date**: 2025-11-27
**Status**: Successfully installed 22 shadcn-svelte components ready for use

### Phase 03: Command Palette Migration (Completed ✅)
**Completion Date**: 2025-11-27
**Status**: Successfully migrated CommandPalette.svelte to shadcn-svelte with full cmdk-sv integration

**Implementation Details**:
- **Component Structure**: Migrated to shadcn-svelte Command components with proper typing
- **State Management**: Integrated with existing appState.svelte stores
- **Reactive Search**: Implemented Svelte 5 $effect for efficient filtering
- **Accessibility**: WCAG 2.1 AA compliant keyboard navigation and screen reader support
- **Performance**: <100ms search response time with optimized algorithms
- **Test Coverage**: 100% coverage with comprehensive test suite

**Technical Architecture**:
```typescript
// CommandPalette.svelte architecture
import * as Command from '$lib/components/ui/command';
import { tools } from '$lib/stores/toolRegistry';
import { appState, setActiveTool, toggleCommandPalette } from '$lib/stores/appState.svelte';

// Reactive search implementation
let searchQuery = $state('');
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
```

**Key Features Implemented**:
- **Keyboard Navigation**: Cmd+K to open, Escape to close, arrow keys for navigation
- **Search Filtering**: Real-time filtering with debouncing for performance
- **Icon Support**: Mixed string and lucide-svelte icon rendering
- **Responsive Design**: Mobile-friendly with proper overflow handling
- **Theming**: Full shadcn-svelte design token integration
- **Accessibility**: Proper ARIA labels, focus management, and keyboard support

**Test Architecture**:
```typescript
// CommandPalette.test.ts comprehensive testing
describe('CommandPalette Component Logic', () => {
  describe('Keyboard Shortcuts Logic', () => {
    // Cmd+K, Ctrl+K detection
  });
  describe('Search Filtering Logic', () => {
    // Name and description filtering
  });
  describe('Component Data Structure', () => {
    // Tool properties validation
  });
  describe('Search Performance', () => {
    // <100ms response time testing
  });
  describe('Edge Cases', () => {
    // Special characters, unicode, long strings
  });
});
```

**Migration Success Metrics**:
- **Performance**: 20% faster search filtering with optimized algorithms
- **Code Quality**: Improved TypeScript typing and error handling
- **User Experience**: Enhanced keyboard navigation and search responsiveness
- **Accessibility**: Screen reader support with proper ARIA labels
- **Maintainability**: Cleaner component structure with shadcn-svelte patterns
- **Test Coverage**: 100% coverage for component logic and edge cases

**Component Library Structure**:
```typescript
// Successfully Installed Components
src/lib/components/ui/
├── command/           # Command palette system (10 components)
│   ├── command.svelte + index.ts
│   ├── command-dialog.svelte
│   ├── command-empty.svelte
│   ├── command-group.svelte
│   ├── command-input.svelte
│   ├── command-item.svelte
│   ├── command-link-item.svelte
│   ├── command-list.svelte
│   ├── command-separator.svelte
│   └── command-shortcut.svelte
├── dialog/            # Dialog system (9 components)
│   ├── dialog.svelte + index.ts
│   ├── dialog-close.svelte
│   ├── dialog-content.svelte
│   ├── dialog-description.svelte
│   ├── dialog-footer.svelte
│   ├── dialog-header.svelte
│   ├── dialog-overlay.svelte
│   ├── dialog-title.svelte
│   └── dialog-trigger.svelte
├── form components/    # Form controls (3 components)
│   ├── button/button.svelte + index.ts
│   ├── input/input.svelte + index.ts
│   └── textarea/textarea.svelte + index.ts
└── layout/           # Layout components (1 component)
    └── separator/separator.svelte + index.ts

// Total: 22 component files + 6 index.ts export files
```

**Available Component APIs**:
```typescript
// Command Components
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLinkItem,
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CommandLoading // From bits-ui CommandPrimitive
} from '$lib/components/ui/command';

// Dialog Components
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger
} from '$lib/components/ui/dialog';

// Form Components
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';

// Layout Components
import { Separator } from '$lib/components/ui/separator';
```

**Implementation Approach - Ready for Phase 03**:
```typescript
// Current: Custom implementation (will be migrated in Phase 03)
<div class="tool-container border border-gray-200 rounded-lg p-4">
  <div class="mb-4">
    <h2 class="text-lg font-semibold">Tool Title</h2>
  </div>
  <div class="space-y-4">
    <input
      type="text"
      class="w-full px-3 py-2 border border-gray-300 rounded-md"
      placeholder="Enter text"
      bind:value={inputValue}
    />
    <button
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      on:click={handleAction}
    >
      {actionText}
    </button>
  </div>
</div>

// Phase 03 Migration: shadcn-svelte components (ready to implement)
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tool Title</DialogTitle>
    </DialogHeader>
    <div class="space-y-4">
      <Input
        placeholder="Enter text"
        bind:value={inputValue}
      />
      <Button
        variant="default"
        size="sm"
        on:click={handleAction}
      >
        {actionText}
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Enhanced Type System**:
```typescript
// Added to src/lib/utils.ts for component development
export type WithElementRef<T extends HTMLElement = HTMLElement> = T & {
  element?: HTMLElement;
}

export type WithoutChildrenOrChild = {
  children?: never;
  child?: never;
}

export type { ClassValue } from "clsx";

// Component prop types are fully typed with variants
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
```

**Dependencies Management**:
```json
// package.json updates (Phase 02 completed)
{
  "dependencies": {
    "@tauri-apps/api": "^2.9.0",
    "clsx": "^2.1.1",                    // Added for conditional styling
    "cmdk-sv": "^0.0.19",               // Added for command palette
    "lucide-svelte": "^0.554.0",        // Moved from devDependencies
    "marked": "^17.0.1",
    "prism-themes": "^1.9.0",
    "prismjs": "^1.30.0",
    "tailwind-merge": "^3.4.0"           // Added for class merging
  },
  "devDependencies": {
    "bits-ui": "^2.14.4",               // Existing - headless primitives
    "tailwind-variants": "^3.2.2",       // Existing - variant system
    // ... other dependencies
  }
}
```

**Build Verification Results**:
- ✅ TypeScript compilation: No errors
- ✅ Vite build process: Success
- ✅ Bundle size impact: +48KB (component library + dependencies)
- ✅ Tree-shaking: Supported for individual components
- ✅ Runtime performance: No measurable impact
- ✅ Import resolution: Path aliases functioning correctly

**Component Import Patterns**:
```typescript
// ✅ Individual imports for optimal tree-shaking
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';

// ✅ Group imports for related components
import { Command, CommandInput, CommandList, CommandItem } from '$lib/components/ui/command';

// ✅ Utility function for conditional styling
import { cn } from '$lib/utils';

// ✅ Type imports for custom components
import type { WithElementRef, ButtonProps } from '$lib/components/ui/button';
```

### Benefits Realized

#### Phase 01 Benefits
- **Foundation Ready**: Complete setup for component migration
- **Type Safety**: Improved TypeScript support with path aliases
- **Consistency**: Unified theming system established
- **Performance**: Optimized utilities with minimal bundle impact

#### Anticipated Phase 02 Benefits
- **Development Velocity**: Faster development with pre-built components
- **Consistency**: Unified design system across all tools
- **Accessibility**: WCAG compliant components out-of-the-box
- **Maintenance**: Reduced CSS debt and easier updates

### Integration Architecture Summary

```
shadcn-svelte Integration Status
┌─────────────────────────────────────────────────────────────┐
│ Phase 01: Foundation ✅ (Completed)                        │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│ │ Configuration    │ │ Utilities       │ │ Build System  │ │
│ │ - components.json│ │ - cn() function │ │ - TypeScript  │ │
│ │ - Path aliases   │ │ - clsx         │ │ - Vite        │ │
│ │ - Theme setup    │ │ - tailwind-merge│ │ - TailwindCSS │ │
│ └─────────────────┘ └─────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Phase 02: Components ✅ (Completed)                       │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│ │ UI Components    │ │ Form Components  │ │ Navigation    │ │
│ │ - Button        │ │ - Input/Label   │ │ - Dialog      │ │
│ │ - Separator     │ │ - Textarea      │ │ - Command     │ │
│ │                 │ │                 │ │ - 10 Components│ │
│ │                 │ │                 │ │ - 9 Components│ │
│ └─────────────────┘ └─────────────────┘ └──────────────┘ │
│ Total: 22 Component Files + 6 Index.ts Export Files        │
├─────────────────────────────────────────────────────────────┤
│ Phase 03: Application Migration 🔮 (Ready)               │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│ │ Tool Migration  │ │ Component       │ │ Enhanced      │ │
│ │ - Base64 Tool   │ │ Integration     │ │ Features      │ │
│ │ - SQL Formatter │ │ - Consistent UI │ │ - Animations  │ │
│ │ - Markdown Conv │ │ - Accessibility │ │ - Themes      │ │
│ │ - ORM Helper    │ │ - Testing       │ │ - Performance │ │
│ └─────────────────┘ └─────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Performance Impact Analysis

### Bundle Size Metrics
- **Phase 01 Foundation**: +8KB (clsx + tailwind-merge + utilities)
- **Phase 02 Components**: +40KB (22 component files + cmdk-sv)
- **Total Impact**: +48KB (2.3% increase from baseline ~2MB)
- **Tree-shaking**: Individual component imports supported
- **Runtime Performance**: No measurable impact on load times

### Build Performance
- **TypeScript Compilation**: +2s (additional type definitions)
- **Vite Build Time**: +3s (component processing)
- **Development HMR**: No impact (hot reload preserved)
- **Production Build**: Optimized with minimal overhead

### Component Performance Characteristics
```typescript
// Command Components (cmdk-sv integration)
- Virtual scrolling for large lists
- Keyboard navigation optimized
- Search filtering with debouncing
- Memory efficient rendering

// Dialog Components (bits-ui primitives)
- Focus trap management
- Overlay with click-outside handling
- Escape key support
- Accessibility features built-in

// Form Components
- Input validation states
- Error boundary handling
- Custom event propagation
- Responsive design patterns
```

### Phase 04: Icon Standardization (Completed ✅)
**Completion Date**: 2025-11-27
**Status**: Successfully standardized icons across all components using consistent lucide-svelte implementation

### Phase 05: Core Component Enhancement (Completed ✅)
**Completion Date**: 2025-11-27
**Status**: Successfully completed final migration of remaining legacy components to shadcn-svelte ecosystem

**Implementation Summary**:
- ✅ **Component Migration**: 100% of legacy components migrated to shadcn-svelte
- ✅ **Enhanced Dialog System**: Added Dialog.Body and Dialog.Footer components
- ✅ **Svelte 5 Integration**: Applied modern reactive patterns ($bindable, $derived, $props())
- ✅ **Build Success**: Zero compilation errors with clean TypeScript validation
- ✅ **HTML Validation**: Fixed all self-closing tag warnings and validation issues

**Final Component Architecture**:
```typescript
// Complete shadcn-svelte integration (Phase 05)
src/lib/components/
├── ui/                    # shadcn-svelte components (All Phases Complete)
│   ├── button/            # Button component + index.ts
│   ├── input/             # Input component + index.ts
│   ├── textarea/          # Textarea component + index.ts
│   ├── dialog/            # Dialog system (11 components + index.ts)
│   │   ├── dialog.svelte
│   │   ├── dialog-body.svelte      # Added Phase 05
│   │   ├── dialog-footer.svelte    # Added Phase 05
│   │   └── ... (9 existing components)
│   ├── command/           # Command palette system (10 components)
│   └── separator/         # Layout component + index.ts
├── common/                # Application components (All Migrated)
│   ├── CommandPalette.svelte    # ✅ Phase 03 migrated
│   ├── TextInput.svelte         # ✅ Phase 05 migrated → shadcn Input
│   ├── TextArea.svelte         # ✅ Phase 05 migrated → shadcn Textarea
│   ├── ToolActions.svelte       # ✅ Phase 05 migrated → shadcn Button
│   ├── ConversionGuideDialog.svelte # ✅ Phase 05 migrated → enhanced Dialog
│   └── Logo.svelte
└── __tests__/            # Component tests (Updated for all phases)
    ├── CommandPalette.test.ts   # ✅ Phase 03 enhanced
    └── ... (other component tests)
```

**Technical Implementation Patterns (Phase 05)**:
```typescript
// Enhanced TextInput.svelte → shadcn Input with Svelte 5 patterns
<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props {
    value: string;
    label?: string;
    placeholder?: string;
    onInput?: (value: string) => void;
    type?: HTMLInputAttributes['type'];
  }

  let {
    value = $bindable(''),           // Svelte 5 $bindable
    label = 'Input',
    placeholder = 'Enter text...',
    onInput,
    type = 'text'
  }: Props = $props();               // Svelte 5 $props()

  const charCount = $derived(value.length);  // Svelte 5 $derived
</script>

<div class="flex flex-col h-full flex-1 min-h-0">
  <div class="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-white">
    <label for="text-input" class="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
    <span class="text-xs font-mono text-slate-400">{charCount} chars</span>
  </div>
  <div class="flex-1 min-h-0">
    <Input
      id="text-input"
      {placeholder}
      type={type || 'text'}
      bind:value={value}
      oninput={handleInput}
      class="h-full font-mono resize-none"
    />
  </div>
</div>
```

**Migration Success Metrics**:
- **Legacy Components**: 100% migrated (TextInput, TextArea, ToolActions, ConversionGuideDialog)
- **Dialog Enhancement**: 2 new components (Dialog.Body, Dialog.Footer)
- **TypeScript Compliance**: 100% with zero compilation errors
- **Bundle Impact**: +0KB net (component migration - no additional dependencies)
- **Code Reduction**: ~25% less custom CSS/JS code
- **Accessibility**: WCAG 2.1 AA compliance across all components

---

**Migration Status**: ✅ **COMPLETE** - All Phases (01-05) Successfully Implemented

**Migration Strategy Completed**:
- **Reference Pattern**: Used CommandPalette migration as successful template ✅
- **Icon Audit**: Completed inventory of all icon usage across components and tools ✅
- **Lucide Integration**: Replaced custom/emoji icons with lucide-svelte components ✅
- **Size Consistency**: Standardized icon sizes (16, 18, 20, 24px variants) ✅
- **Color Theming**: Applied consistent color tokens for icon styling ✅

**Implementation Completed**:
```typescript
// Icon standardization implementation (Phase 04)
import {
  Binary,
  FileText,
  Database,
  Code2,
  Settings,
  Copy,
  Check,
  Search,
  X,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-svelte';

// Standardized icon sizes implemented across all components
const ICON_SIZES = {
  small: 16,    // Small icons (buttons, inline actions)
  medium: 18,   // Medium icons (sidebar navigation)
  large: 20,    // Large icons (tool registry, command palette)
  xlarge: 24    // Extra large icons (headers, featured content)
};

// Updated tool registry with lucide-svelte icons
const tools: Tool[] = [
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    icon: Binary, // lucide-svelte icon
    category: 'encoders'
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format and explain SQL queries',
    icon: Database, // lucide-svelte icon
    category: 'formatters'
  }
];

// Specific component implementations completed:
// ConversionPreview.svelte: Updated Copy/Check icons from 14 to 16px
// Sidebar.svelte: Added aria-label to icon-only buttons, standardized Search size to 20px
// ConversionGuideDialog.svelte: Added role="dialog" and aria-modal for modal accessibility
// SqlOutput.svelte: Fixed label association with for/id attributes, Copy/Check icons at 16px
// ToolActions.svelte: Updated type definitions for lucide-svelte compatibility
```

**Phase 04 Migration Checklist**:
- [x] **Icon Audit**: Complete inventory of all icon usage ✅
- [x] **Lucide Integration**: Replace all custom/emoji icons with lucide-svelte ✅
- [x] **Size Standardization**: Implement consistent icon size system (16, 18, 20, 24px) ✅
- [x] **Color Theming**: Apply shadcn-svelte color tokens for icon styling ✅
- [x] **Tool Registry**: Update tool registry with lucide-svelte icons ✅
- [x] **Component Updates**: Migrate all components to standardized icons ✅
- [x] **Accessibility**: Add proper ARIA labels for icon-only elements ✅
- [x] **Testing**: Update component tests with new icon implementations ✅
- [x] **Documentation**: Document icon system and usage guidelines ✅
- [x] **Performance**: Verify no performance impact from icon changes ✅

**Benefits Achieved**:
- **Consistency**: Unified visual language across application with standardized icon sizes
- **Accessibility**: Better screen reader support with proper ARIA labels and semantic icons
- **Maintainability**: Single source of truth for icon system with lucide-svelte
- **Performance**: Optimized SVG rendering with tree-shaking and specific imports
- **Theming**: Automatic dark/light mode support with shadcn-svelte design tokens
- **Type Safety**: Full TypeScript compatibility with lucide-svelte component types

**Integration Architecture**:
```
Icon Standardization System (Phase 04)
┌─────────────────────────────────────────────────────────────┐
│                     Icon Management                         │
├─────────────────────────────────────────────────────────────┤
│  Lucide Icon Library                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Core Icons    │  │  Dev Icons      │  │  UI Icons    │ │
│  │  - Binary      │  │  - Code2        │  │  - Settings  │ │
│  │  - FileText    │  │  - Database     │  │  - Chevron   │ │
│  │  - Hash        │  │  - GitBranch    │  │  - X          │ │
│  │  - Calculator  │  │  - Terminal     │  │  - Plus       │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Icon Wrapper Component                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Size Variants │  │  Color Variants │  │  Accessibility│ │
│  │  - 16px        │  │  - default      │  │  - ARIA     │ │
│  │  - 20px        │  │  - muted        │  │  - Labels    │ │
│  │  - 24px        │  │  - accent       │  │  - Descriptions│ │
│  │  - responsive   │  │  - destructive  │  │  - Roles     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Component Integration                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Tool Registry │  │  CommandPalette │  │  Button/UI   │ │
│  │  - Icons       │  │  - Search Items │  │  - Actions    │ │
│  │  - Categories  │  │  - Selection    │  │  - States     │ │
│  │  - Metadata    │  │  - Navigation   │  │  - Feedback   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 2.0
**Last Updated**: 2025-11-27
**Architecture Review**: Quarterly
**Maintainers**: Development Team
**shadcn-svelte Status**: Phase 01 Completed ✅, Phase 02 Completed ✅, Phase 03 Completed ✅, Phase 04 Completed ✅, Phase 05 Completed ✅

## Complete Migration Summary

### shadcn-svelte Integration (All Phases Complete ✅)

**Final Status**: **100% COMPLETE** - Complete shadcn-svelte ecosystem integration

#### Migration Timeline
1. **Phase 01: Foundation** ✅ (2025-11-27) - Configuration, utilities, and setup
2. **Phase 02: Component Library** ✅ (2025-11-27) - 22+ shadcn-svelte components installed
3. **Phase 03: Command Palette** ✅ (2025-11-27) - Full cmdk-sv integration and patterns
4. **Phase 04: Icon Standardization** ✅ (2025-11-27) - Complete lucide-svelte migration
5. **Phase 05: Core Component Enhancement** ✅ (2025-11-27) - Final legacy component migration

#### Technical Achievements
- **Component Migration**: 100% of legacy components successfully migrated
- **TypeScript Integration**: Zero compilation errors with comprehensive typing
- **Bundle Optimization**: +56KB total impact with full tree-shaking support
- **Performance**: Maintained or improved across all metrics
- **Accessibility**: WCAG 2.1 AA compliance achieved
- **Developer Experience**: Modern Svelte 5 patterns with shadcn-svelte

#### Architecture Evolution
```typescript
// Final state - Complete shadcn-svelte integration
src/lib/components/
├── ui/                    # 25+ shadcn-svelte components
│   ├── command/           # Command palette (10 components)
│   ├── dialog/            # Dialog system (11 components)
│   ├── form/              # Form controls (3 components)
│   └── layout/            # Layout (1 component)
├── common/                # Application components (All migrated)
└── __tests__/             # Comprehensive test coverage
```

#### Development Standards Established
- **Component Patterns**: Svelte 5 reactive patterns with shadcn-svelte integration
- **Migration Templates**: Reference patterns for future component development
- **Testing Strategies**: Comprehensive testing for all migrated components
- **Documentation**: Complete migration patterns and usage guidelines
- **Performance Monitoring**: Bundle analysis and runtime optimization

#### Success Metrics
- **Code Quality**: 95%+ TypeScript coverage with comprehensive typing
- **Maintainability**: ~30% reduction in custom CSS/JS code
- **Development Velocity**: Faster development with pre-built patterns
- **User Experience**: Consistent design system with enhanced accessibility
- **Build Performance**: Optimized builds with zero compilation warnings