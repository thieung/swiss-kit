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
  <div class="flex justify-between items-center mb-2">
    <span class="text-sm font-medium text-gray-700">{format} Output</span>
    <span class="text-xs text-gray-500">{charCount} characters</span>
  </div>
  <div bind:this={element} class="w-full h-full p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 overflow-auto relative" role="region" aria-label={`${format} output preview`}>
    {#if format === 'Preview'}
      <div class="prose prose-sm max-w-none">
        {@html output || '<p class="text-gray-400">Preview will appear here...</p>'}
      </div>
    {:else}
      <div class="whitespace-pre-wrap">
        {output || 'Output will appear here...'}
      </div>
    {/if}
  </div>

  {#if output}
    <button
      onclick={handleCopy}
      class="absolute top-10 right-4 p-2 bg-white border border-gray-200 rounded-md shadow-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      aria-label="Copy output"
    >
      {#if copied}
        <Check size={16} class="text-green-600" />
      {:else}
        <Copy size={16} />
      {/if}
    </button>
  {/if}
</div>