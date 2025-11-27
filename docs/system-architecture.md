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
│   ├── ui/              # shadcn-svelte components (Phase 02)
│   │   ├── button.svelte
│   │   ├── input.svelte
│   │   ├── card.svelte
│   │   ├── dialog.svelte
│   │   ├── alert.svelte
│   │   ├── label.svelte
│   │   └── ... (other shadcn-svelte components)
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
│   └── toolStateStore.ts
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

### Phase 02: Component Migration (Ready 🚀)
**Status**: Foundation complete, ready for component migration
**Implementation Strategy**: Gradual migration with feature parity

**Migration Priority**:
1. **High-Priority**: Button, Input, Card, Alert components
2. **Medium-Priority**: Dialog, Select, Checkbox, Radio components
3. **Low-Priority**: Advanced components (Charts, Tables, etc.)

**Implementation Approach**:
```typescript
// Before: Custom component
<div class="tool-container">
  <button
    class="px-4 py-2 bg-blue-600 text-white rounded-md"
    on:click={handleAction}
  >
    {actionText}
  </button>
</div>

// After: shadcn-svelte component
<Card class="tool-container">
  <Button
    variant="default"
    size="sm"
    on:click={handleAction}
  >
    {actionText}
  </Button>
</Card>
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
│ Phase 02: Components 🚀 (Ready)                           │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│ │ UI Components    │ │ Form Components  │ │ Navigation    │ │
│ │ - Button        │ │ - Input/Label   │ │ - Dialog      │ │
│ │ - Card          │ │ - Select        │ │ - Sheet       │ │
│ │ - Alert         │ │ - Checkbox      │ │ - Tabs        │ │
│ │ - Badge         │ │ - Radio         │ │ - Dropdown    │ │
│ └─────────────────┘ └─────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Phase 03: Enhancements 🔮 (Future)                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│ │ Custom Themes   │ │ Plugin System   │ │ Enhanced UI   │ │
│ │ - Brand colors  │ │ - Component Reg │ │ - Animations  │ │
│ │ - Custom styles │ │ - Theme Hooks   │ │ - Micro-interactions │ │
│ │ - Responsive    │ │ - Plugin UI     │ │ - Advanced Patterns │ │
│ └─────────────────┘ └─────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.1
**Last Updated**: 2025-11-27
**Architecture Review**: Quarterly
**Maintainers**: Development Team
**shadcn-svelte Status**: Phase 01 Completed ✅, Phase 02 Ready 🚀