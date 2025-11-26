export const appState = $state({
  activeTool: 'base64' as string | null,
  commandPaletteOpen: false,
  sidebarCollapsed: false,
});

export function setActiveTool(toolId: string | null) {
  appState.activeTool = toolId;
}

export function toggleSidebar() {
  appState.sidebarCollapsed = !appState.sidebarCollapsed;
}

export function toggleCommandPalette() {
  appState.commandPaletteOpen = !appState.commandPaletteOpen;
}