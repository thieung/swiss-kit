<script lang="ts">
  import { Command } from 'cmdk-sv';
  import { tools } from '$lib/stores/toolRegistry';
  import { appState, setActiveTool, toggleCommandPalette } from '$lib/stores/appState.svelte';

  function selectTool(toolId: string) {
    setActiveTool(toolId);
    toggleCommandPalette();
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
    }
  }
  let searchQuery = $state('');

  const filteredTools = $derived(
    searchQuery === ''
      ? tools
      : tools.filter(tool =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
  );
</script>

<svelte:window onkeydown={handleKeydown} />

{#if appState.commandPaletteOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] transition-all duration-200"
    onclick={() => toggleCommandPalette()}
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 ring-1 ring-black/5 transform transition-all"
      onclick={(e) => e.stopPropagation()}
    >
      <Command.Root shouldFilter={false}>
        <div class="flex items-center border-b border-slate-100 px-4">
          <svg class="w-5 h-5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <Command.Input autofocus bind:value={searchQuery} placeholder="Search tools..." class="w-full py-4 text-lg text-slate-800 placeholder:text-slate-400 outline-none bg-transparent" />
          <div class="text-xs text-slate-400 font-medium px-2 py-1 rounded bg-slate-100 border border-slate-200">ESC</div>
        </div>
        <Command.List class="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <Command.Empty class="py-12 text-center text-slate-500">
            <p class="text-sm">No tools found.</p>
          </Command.Empty>
          {#each filteredTools as tool (tool.id)}
            <Command.Item
              value={tool.id}
              onSelect={() => selectTool(tool.id)}
              class="group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900 hover:bg-slate-50"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-white border border-slate-200 shadow-sm text-xl group-data-[selected=true]:border-indigo-200 group-data-[selected=true]:bg-indigo-100">
                {#if typeof tool.icon === 'string'}
                  {tool.icon}
                {:else if tool.icon}
                  <tool.icon size={20} />
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-900 group-data-[selected=true]:text-indigo-900">{tool.name}</div>
                <div class="text-sm text-slate-500 truncate group-data-[selected=true]:text-indigo-700/80">{tool.description}</div>
              </div>
              {#if tool.shortcut}
                <div class="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 group-data-[selected=true]:bg-indigo-100 group-data-[selected=true]:text-indigo-600 group-data-[selected=true]:border-indigo-200">
                  {tool.shortcut}
                </div>
              {/if}
            </Command.Item>
          {/each}
        </Command.List>
        <div class="bg-slate-50 border-t border-slate-100 px-4 py-2 text-xs text-slate-500 flex justify-between">
          <span>Select a tool to open</span>
          <div class="flex gap-3">
            <span class="flex items-center gap-1"><kbd class="font-sans bg-white border border-slate-200 rounded px-1">↑</kbd> <kbd class="font-sans bg-white border border-slate-200 rounded px-1">↓</kbd> to navigate</span>
            <span class="flex items-center gap-1"><kbd class="font-sans bg-white border border-slate-200 rounded px-1">↵</kbd> to select</span>
          </div>
        </div>
      </Command.Root>
    </div>
  </div>
{/if}