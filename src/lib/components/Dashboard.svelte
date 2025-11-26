<script lang="ts">
  import { tools } from '$lib/stores/toolRegistry';
  import { setActiveTool } from '$lib/stores/appState.svelte';
  import { ArrowRight } from 'lucide-svelte';
  import Logo from '$lib/components/Logo.svelte';

  const categories = ['converters', 'encoders', 'formatters', 'generators', 'utils'];

  function getToolsByCategory(category: string) {
    return tools.filter(t => t.category === category);
  }
</script>

<div class="max-w-5xl mx-auto">
  <div class="mb-10 text-center flex flex-col items-center">
    <div class="mb-6">
      <Logo size={64} />
    </div>
    <h1 class="text-4xl font-bold tracking-tight text-slate-900 mb-4">SwissKit</h1>
    <p class="text-lg text-slate-600 max-w-2xl mx-auto">
      The Swiss Army knife for developers.
    </p>
  </div>

  <div class="space-y-12">
    {#each categories as category}
      {@const categoryTools = getToolsByCategory(category)}
      {#if categoryTools.length > 0}
        <section>
          <h2 class="text-xl font-semibold text-slate-900 mb-6 capitalize flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
            {category}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each categoryTools as tool}
              <button
                onclick={() => setActiveTool(tool.id)}
                class="group flex flex-col items-start p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 text-left w-full"
              >
                <div class="p-3 rounded-lg bg-indigo-50 text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-200">
                  <tool.icon size={24} />
                </div>
                <h3 class="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {tool.name}
                </h3>
                <p class="text-slate-600 text-sm mb-4 line-clamp-2">
                  {tool.description}
                </p>
                <div class="mt-auto flex items-center text-sm font-medium text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                  Open Tool <ArrowRight size={16} class="ml-1" />
                </div>
              </button>
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>
</div>
