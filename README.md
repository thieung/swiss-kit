# SwissKit

A modern desktop developer tools application built with Tauri 2.x + Svelte 5 + TailwindCSS.

## Quick Start

### Prerequisites

- **Rust 1.86+** - [Install Rust](https://rustup.rs/)
- **Node.js 20+** - [Install Node.js](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm)
- **Tauri CLI** - Installed automatically or via `cargo install tauri-cli --version "^2.0.0"`

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd swisskit
```

2. Install dependencies:
```bash
npm install
```

3. Start development mode:
```bash
npm run tauri:dev
```

### Development

- `npm run dev` - Start Vite dev server
- `npm run tauri:dev` - Start Tauri app with hot-reload
- `npm run build` - Build for web
- `npm run tauri:build` - Build desktop application
- `npm run check` - Run TypeScript checks
- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint

## Project Structure

```
swisskit/
├── src/                      # Svelte frontend
│   ├── lib/
│   │   ├── components/      # Shared components
│   │   ├── stores/          # Svelte stores (appState with theme)
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── routes/              # SvelteKit routes (if using routing)
│   ├── app.css              # Global styles + Tailwind v4 @theme
│   └── main.ts              # Entry point
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── commands/        # Tauri commands
│   │   ├── lib.rs           # Library entry
│   │   └── main.rs          # App entry
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── static/                  # Static assets
├── package.json
├── vite.config.ts           # Vite configuration + Tailwind v4 plugin
├── tailwind.config.js       # Minimal config (IDE-only)
├── tsconfig.json            # TypeScript configuration
├── index.html               # FOUC prevention script
└── README.md
```

## Technology Stack

- **Frontend**: Svelte 5 with TypeScript and runes ($state, $derived, $effect)
- **Backend**: Rust with Tauri 2.x
- **Styling**: Tailwind CSS v4.1.17 (CSS-first with Vite plugin)
- **Fonts**: Self-hosted Geist Variable & Geist Mono Variable (offline-compatible)
- **Colors**: OKLCH color space for perceptual uniformity
- **Build Tool**: Vite with optimized bundling
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **UI Components**: shadcn-svelte ecosystem with 25+ components

## Features

- **Modern UI**: Tailwind CSS v4 with CSS-first @theme directive configuration
- **Theme Switching**: Dark/Light/System mode with localStorage persistence and system preference detection
- **Self-hosted Fonts**: Geist Variable font family for optimal performance and offline compatibility
- **OKLCH Colors**: Perceptually uniform color system with automatic dark/light mode variants
- **FOUC Prevention**: Blocking script in index.html for flicker-free theme initialization
- **Reactive State**: Svelte 5 runes for modern reactive state management
- **Command Palette**: Keyboard-driven navigation with cmdk-sv integration
- **Component System**: Full shadcn-svelte ecosystem with accessibility features

## Window Configuration

- Default size: 1200x800px
- Minimum size: 800x600px
- Resizable: Yes
- Fullscreen: No

## Build Output

Production builds create optimized bundles <10MB in `src-tauri/target/release/bundle/`.

## License

[License choice to be determined]