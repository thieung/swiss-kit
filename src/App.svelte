<script lang="ts">
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import ToolWrapper from '$lib/components/ToolWrapper.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { tools } from '$lib/stores/toolRegistry';
  import { appState, setActiveTool } from '$lib/stores/appState.svelte';
  import type { Tool } from '$lib/types/tool';
  import { ChevronRight } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";
  import SearchIcon from "@lucide/svelte/icons/search";

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

<div class="min-h-screen bg-background text-foreground flex">
  <div class="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,var(--color-muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted)_1px,transparent_1px)] bg-[size:14px_24px] opacity-50"></div>

  <Sidebar />

  <main class="flex-1 {appState.sidebarCollapsed ? 'ml-20' : 'ml-64'} min-h-screen flex flex-col transition-all duration-300 ease-in-out">
    <!-- Breadcrumbs Header -->
    <header class="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 px-8 flex items-center justify-between">
      <div class="flex items-center text-sm text-muted-foreground">
        <button
          class="hover:text-foreground transition-colors"
          onclick={() => setActiveTool(null)}
        >
          SwissKit
        </button>
        {#if activeTool}
          <ChevronRight size={16} class="mx-2" />
          <span class="font-medium text-foreground">{activeTool.name}</span>
        {/if}
      </div>

      <div class="flex items-center gap-4">
        <Button
          variant="outline"
          class="relative h-9 w-64 justify-start bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
          onclick={() => appState.commandPaletteOpen = true}
        >
          <SearchIcon class="mr-2 h-4 w-4" />
          <span class="hidden lg:inline-flex">Search documentation...</span>
          <span class="inline-flex lg:hidden">Search...</span>
          <kbd class="pointer-events-none absolute right-1.5 top-[50%] -translate-y-[50%] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span class="text-xs">⌘</span>K
          </kbd>
        </Button>
        <ThemeToggle />
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
