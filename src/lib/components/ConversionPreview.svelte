<script lang="ts">
  import { Copy, Check } from 'lucide-svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';

  interface Props {
    output: string;
    format: string;
    element?: HTMLDivElement;
  }

  let { output, format, element = $bindable() }: Props = $props();

  const charCount = $derived(output.length);
  let copied = $state(false);

  async function handleCopy() {
    if (!output) return;
    await copyToClipboard(output);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<div class="flex flex-col h-full relative group flex-1 min-h-0">
  <div class="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/80">
    <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{format} Output</span>
    <div class="flex items-center gap-3">
      <span class="text-xs font-mono text-muted-foreground">{charCount} chars</span>
      {#if output}
        <button
          onclick={handleCopy}
          class="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          aria-label="Copy output"
        >
          {#if copied}
            <Check size={16} />
          {:else}
            <Copy size={16} />
          {/if}
        </button>
      {/if}
    </div>
  </div>

  <div bind:this={element} class="w-full h-full p-4 font-mono text-sm overflow-auto relative bg-transparent" role="region" aria-label={`${format} output preview`}>
    {#if format === 'Preview'}
      <div class="prose prose-sm max-w-none prose-slate prose-headings:font-semibold prose-a:text-indigo-600">
        {@html output || '<p class="text-muted-foreground italic">Preview will appear here...</p>'}
      </div>
    {:else}
      <div class="whitespace-pre-wrap text-foreground leading-relaxed">
        {#if output}
          {output}
        {:else}
          <span class="text-muted-foreground italic">Output will appear here...</span>
        {/if}
      </div>
    {/if}
  </div>
</div>