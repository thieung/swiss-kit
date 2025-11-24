<script lang="ts">
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import ToolWrapper from '$lib/components/ToolWrapper.svelte';
  import { tools } from '$lib/stores/toolRegistry';
  import { appState, setActiveTool } from '$lib/stores/appState.svelte';
  import type { Tool } from '$lib/types/tool';

  const activeTool = $derived(tools.find((t: Tool) => t.id === appState.activeTool) || tools[0]);

  // Handle global keyboard shortcuts for tools
  function handleKeydown(e: KeyboardEvent) {
    // Check for Cmd+Shift+B or Cmd+Shift+M
    if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
      const key = e.key.toLowerCase();

      // Find tool with matching shortcut
      const tool = tools.find(t => {
        if (!t.shortcut) return false;
        const shortcutKey = t.shortcut.split('+').pop()?.toLowerCase();
        return shortcutKey === key;
      });

      if (tool) {
        e.preventDefault();
        setActiveTool(tool.id);
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main class="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
  <div class="fixed inset-0 -z-10 h-full w-full bg-slate-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

  <header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
    <div class="container mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8">
      <div class="mr-4 hidden md:flex">
        <a class="mr-6 flex items-center space-x-2" href="/">
          <span class="hidden font-bold sm:inline-block text-xl tracking-tight">SwissKit</span>
        </a>
      </div>
      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <button
            onclick={() => appState.commandPaletteOpen = true}
            class="inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2 relative w-full justify-start text-sm text-slate-500 sm:pr-12 md:w-40 lg:w-64"
          >
            <span class="hidden lg:inline-flex">Search tools...</span>
            <span class="inline-flex lg:hidden">Search...</span>
            <kbd class="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 sm:flex">
              <span class="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>
    </div>
  </header>

  <div class="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <CommandPalette />
    {#if activeTool}
      <ToolWrapper tool={activeTool} />
    {/if}
  </div>
</main>
