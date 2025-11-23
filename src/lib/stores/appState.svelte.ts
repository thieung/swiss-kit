export const appState = $state({
  activeTool: 'base64',
  commandPaletteOpen: false,
});

export function setActiveTool(toolId: string) {
  appState.activeTool = toolId;
}

export function toggleCommandPalette() {
  appState.commandPaletteOpen = !appState.commandPaletteOpen;
}