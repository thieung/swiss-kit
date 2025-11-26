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
│   ├── common/          # Generic components
│   │   ├── Button.svelte
│   │   ├── Input.svelte
│   │   ├── Modal.svelte
│   │   └── Loading.svelte
│   ├── layout/          # Layout components
│   │   ├── Header.svelte
│   │   ├── Sidebar.svelte
│   │   ├── Footer.svelte
│   │   └── Main.svelte
│   └── syntax/          # Syntax highlighting components
│       ├── CodeBlock.svelte
│       ├── SqlOutput.svelte
│       └── MarkdownPreview.svelte
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
│   └── performance.ts
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

#### Tool Component Template
```typescript
// tools/BaseToolTemplate.svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

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

## Future Architecture Considerations

### Plugin System

```
┌─────────────────────────────────────────────────────────────┐
│                    Plugin Architecture                       │
├─────────────────────────────────────────────────────────────┤
│  Plugin Manager                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Plugin Loader  │  │  Plugin Registry│  │  Sandboxing  │ │
│  │  - Dynamic Load │  │  - Metadata     │  │  - Isolation  │ │
│  │  - Validation   │  │  - Permissions  │  │  - Resources  │ │
│  │  - Lifecycle    │  │  - Dependencies │  │  - Limits     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Plugin API                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  UI Hooks       │  │  Data Hooks     │  │  Event Hooks │ │
│  │  - Components   │  │  - Converters   │  │  - Listeners  │ │
│  │  - Themes       │  │  - Validators   │  │  - Emitters  │ │
│  │  - Actions      │  │  - Formatters   │  │  - Handlers  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Core Application                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Built-in Tools │  │  Extension API  │  │  Plugin UI   │ │
│  │  - Base64       │  │  - Registration │  │  - Injection │ │
│  │  - SQL Formatter│  │  - Communication│  │  - Layouts   │ │
│  │  - Markdown     │  │  - State Mgmt   │  │  - Controls  │ │
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

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Architecture Review**: Quarterly
**Maintainers**: Development Team