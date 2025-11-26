<script lang="ts">
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import ToolWrapper from '$lib/components/ToolWrapper.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import { tools } from '$lib/stores/toolRegistry';
  import { appState, setActiveTool } from '$lib/stores/appState.svelte';
  import type { Tool } from '$lib/types/tool';
  import { ChevronRight } from 'lucide-svelte';

  const activeTool = $derived(appState.activeTool ? tools.find((t: Tool) => t.id === appState.activeTool) : null);

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

<div class="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex">
  <div class="fixed inset-0 -z-10 h-full w-full bg-slate-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

  <Sidebar />

  <main class="flex-1 {appState.sidebarCollapsed ? 'ml-20' : 'ml-64'} min-h-screen flex flex-col transition-all duration-300 ease-in-out">
    <!-- Breadcrumbs Header -->
    <header class="h-14 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-40 px-8 flex items-center justify-between">
      <div class="flex items-center text-sm text-slate-500">
        <button
          class="hover:text-slate-900 transition-colors"
          onclick={() => setActiveTool(null)}
        >
          SwissKit
        </button>
        {#if activeTool}
          <ChevronRight size={16} class="mx-2" />
          <span class="font-medium text-slate-900">{activeTool.name}</span>
        {/if}
      </div>

      <div class="flex items-center gap-4">
        <button
          onclick={() => appState.commandPaletteOpen = true}
          class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-500 hover:border-slate-300 transition-colors"
        >
          <span>Search...</span>
          <kbd class="font-mono bg-slate-100 px-1 rounded border border-slate-200">⌘K</kbd>
        </button>
      </div>
    </header>

    <div class="flex-1 p-8">
      <CommandPalette />
      {#if activeTool}
        <ToolWrapper tool={activeTool} />
      {:else}
        <Dashboard />
      {/if}
    </div>
  </main>
</div>
