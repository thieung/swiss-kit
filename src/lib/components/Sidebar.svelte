<script lang="ts">
  import { tools } from '$lib/stores/toolRegistry';
  import { appState, setActiveTool, toggleSidebar } from '$lib/stores/appState.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import { Search, Home, ChevronLeft, ChevronRight } from 'lucide-svelte';

  let searchQuery = $state('');

  const filteredTools = $derived(
    tools.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const categories = ['converters', 'encoders', 'formatters', 'generators', 'utils'];

  function getToolsByCategory(category: string) {
    return filteredTools.filter(t => t.category === category);
  }
</script>

<aside class="{appState.sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out">
  <!-- Header -->
  <div class="h-14 flex items-center {appState.sidebarCollapsed ? 'justify-center' : 'px-4'} border-b border-slate-200 relative">
    <button
      class="flex items-center gap-2 hover:opacity-80 transition-opacity"
      onclick={() => setActiveTool(null)}
    >
      <Logo size={24} />
      {#if !appState.sidebarCollapsed}
        <span class="font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap overflow-hidden">SwissKit</span>
      {/if}
    </button>
  </div>

  <!-- Search -->
  <div class="p-4 border-b border-slate-200 {appState.sidebarCollapsed ? 'flex justify-center' : ''}">
    {#if !appState.sidebarCollapsed}
      <div class="relative w-full">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search tools..."
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>
    {:else}
      <button
        class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        onclick={() => appState.sidebarCollapsed = false}
      >
        <Search size={20} />
      </button>
    {/if}
  </div>

  <!-- Navigation -->
  <div class="flex-1 overflow-y-auto py-4 px-3 space-y-6">
    <!-- Home Item -->
    <div>
      <button
        onclick={() => setActiveTool(null)}
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        {appState.activeTool === null
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
        {appState.sidebarCollapsed ? 'justify-center' : ''}"
        title={appState.sidebarCollapsed ? 'Dashboard' : ''}
      >
        <Home size={18} />
        {#if !appState.sidebarCollapsed}
          <span class="truncate">Dashboard</span>
        {/if}
      </button>
    </div>

    {#each categories as category}
      {@const categoryTools = getToolsByCategory(category)}
      {#if categoryTools.length > 0}
        <div>
          {#if !appState.sidebarCollapsed}
            <h3 class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 truncate">
              {category}
            </h3>
          {/if}
          <div class="space-y-1">
            {#each categoryTools as tool}
              <button
                onclick={() => setActiveTool(tool.id)}
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                {appState.activeTool === tool.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                {appState.sidebarCollapsed ? 'justify-center' : ''}"
                title={appState.sidebarCollapsed ? tool.name : ''}
              >
                <tool.icon size={18} />
                {#if !appState.sidebarCollapsed}
                  <span class="truncate">{tool.name}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Toggle Button -->
  <div class="p-4 border-t border-slate-200 flex {appState.sidebarCollapsed ? 'justify-center' : 'justify-end'}">
    <button
      onclick={toggleSidebar}
      class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
      title={appState.sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    >
      {#if appState.sidebarCollapsed}
        <ChevronRight size={20} />
      {:else}
        <ChevronLeft size={20} />
      {/if}
    </button>
  </div>
</aside>
