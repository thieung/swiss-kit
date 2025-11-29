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
    <h1 class="text-4xl font-bold tracking-tight text-foreground mb-4">SwissKit</h1>
    <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
      The Swiss Army knife for developers.
    </p>
  </div>

  <div class="space-y-12">
    {#each categories as category}
      {@const categoryTools = getToolsByCategory(category)}
      {#if categoryTools.length > 0}
        <section>
          <h2 class="text-xl font-semibold text-foreground mb-6 capitalize flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            {category}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each categoryTools as tool}
              <button
                onclick={() => setActiveTool(tool.id)}
                class="group flex flex-col items-start p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 text-left w-full"
              >
                <div class="p-3 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
                  <tool.icon size={24} />
                </div>
                <h3 class="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p class="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {tool.description}
                </p>
                <div class="mt-auto flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
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
