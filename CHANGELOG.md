# Changelog

All notable changes to SwissKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING:** Markdown code blocks without language tags now render unstyled (no auto-detection)
- **BREAKING:** CSS class names changed from `.hljs` to `.language-{lang}` for syntax highlighting
- Migrated syntax highlighting from highlight.js to Prism.js for better performance and bundle size

### Added
- Language alias support (js→javascript, ts→typescript, sh→bash, md→markdown, yml→yaml, json5→json)
- Case-insensitive language identifier matching
- Comprehensive unit tests for markdown-to-html converter
- XSS protection with HTML escaping for unstyled code blocks

### Migration Guide
- **Before:** `````code````` would auto-detect language and highlight
- **After:** `````code````` renders as plain text (unstyled)
- **Solution:** Always specify language: ``````sql`SELECT * FROM users;``````

### Supported Languages
- **SQL** - Database queries and scripts
- **JavaScript** (alias: `js`) - JavaScript code
- **TypeScript** (alias: `ts`) - TypeScript code
- **Bash** (alias: `sh`, `shell`) - Shell commands
- **JSON** (alias: `json5`) - JSON data
- **Markdown** (alias: `md`) - Markdown text

### Technical Details
- **Bundle Size Reduction:** ~300KB (from monolithic to modular)
- **Performance:** ~9% faster highlighting per Prism.js benchmarks
- **CSS Classes:** Changed from `.hljs` to `.language-{lang}` (Phase 04 will update themes)

### Security
- HTML escaping for unstyled code blocks prevents XSS attacks
- Prism.js v1.30.0 has no known CVEs