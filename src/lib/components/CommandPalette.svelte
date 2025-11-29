<script lang="ts">
  import * as Command from '$lib/components/ui/command';
  import { Command as CommandPrimitive } from "bits-ui";
  import SearchIcon from "@lucide/svelte/icons/search";
  import { tools } from '$lib/stores/toolRegistry';
  import { appState, setActiveTool, toggleCommandPalette } from '$lib/stores/appState.svelte';

  let searchQuery = $state('');

  // Filter tools based on search query
  $effect(() => {
    if (!searchQuery.trim()) {
      filteredTools = tools;
    } else {
      filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  });

  let filteredTools = $state(tools);

  // Select a tool and close the palette
  function selectTool(toolId: string) {
    setActiveTool(toolId);
    toggleCommandPalette();
    searchQuery = '';
  }

  // Listen for Cmd+K and Escape
  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    if (e.key === 'Escape' && appState.commandPaletteOpen) {
      e.preventDefault();
      toggleCommandPalette();
      searchQuery = '';
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if appState.commandPaletteOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] transition-all duration-200"
    onclick={() => toggleCommandPalette()}
  >
    <div
      class="bg-popover rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border ring-1 ring-black/5 transform transition-all"
      onclick={(e) => e.stopPropagation()}
    >
      <Command.Root shouldFilter={false}>
        <div class="flex items-center border-b border-border px-4">
          <SearchIcon class="mr-2 size-5 text-muted-foreground" />
          <CommandPrimitive.Input id="command-palette-search" name="command-palette-search" autofocus bind:value={searchQuery} placeholder="Search tools..." class="flex-1 py-4 text-lg text-foreground placeholder:text-muted-foreground outline-none bg-transparent" />
          <div class="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-muted border border-border ml-2">ESC</div>
        </div>
        <Command.List class="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <Command.Empty class="py-12 text-center text-muted-foreground">
            <p class="text-sm">No tools found.</p>
          </Command.Empty>
          {#each filteredTools as tool (tool.id)}
            <Command.Item
              value={tool.id}
              onSelect={() => selectTool(tool.id)}
              class="group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary hover:bg-accent"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border shadow-sm text-xl group-data-[selected=true]:border-primary/30 group-data-[selected=true]:bg-primary/5">
                {#if typeof tool.icon === 'string'}
                  {tool.icon}
                {:else if tool.icon}
                  <tool.icon size={20} />
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-foreground group-data-[selected=true]:text-primary">{tool.name}</div>
                <div class="text-sm text-muted-foreground truncate group-data-[selected=true]:text-primary/80">{tool.description}</div>
              </div>
            </Command.Item>
          {/each}
        </Command.List>
      </Command.Root>
    </div>
  </div>
{/if}

