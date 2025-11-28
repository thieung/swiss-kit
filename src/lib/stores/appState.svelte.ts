type ThemeMode = 'light' | 'dark' | 'system';

// Initialize theme from localStorage or default to system
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

export const appState = $state({
  activeTool: 'base64' as string | null,
  commandPaletteOpen: false,
  sidebarCollapsed: false,
  themeMode: getInitialTheme(),
});

// Function to get resolved theme (respects system preference)
export function getResolvedTheme(): 'light' | 'dark' {
  if (appState.themeMode !== 'system') {
    return appState.themeMode;
  }
  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function setActiveTool(toolId: string | null) {
  appState.activeTool = toolId;
}

export function toggleSidebar() {
  appState.sidebarCollapsed = !appState.sidebarCollapsed;
}

export function toggleCommandPalette() {
  appState.commandPaletteOpen = !appState.commandPaletteOpen;
}

export function setTheme(mode: ThemeMode) {
  appState.themeMode = mode;

  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-mode', mode);

    // Apply theme class to html element
    const theme = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  }
}

// Initialize theme on app mount
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const mode = getInitialTheme();
  const theme = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;

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
