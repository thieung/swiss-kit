<script lang="ts">
  import { Copy, Check } from 'lucide-svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';
  import PrismHighlight from './PrismHighlight.svelte';
  import 'prismjs/components/prism-sql';

  interface Props {
    value: string;
    error?: string;
  }

  let { value, error }: Props = $props();

  const lineCount = $derived(value.split('\n').length);
  const charCount = $derived(value.length);
  let copied = $state(false);

  async function handleCopy() {
    if (!value) return;
    await copyToClipboard(value);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="flex flex-col h-full relative group flex-1 min-h-0">
  <div class="flex justify-between items-center mb-2">
    <label class="text-sm font-medium text-foreground" for="sql-output">Formatted SQL</label>
    <span class="text-xs text-muted-foreground">{lineCount} lines, {charCount} chars</span>
  </div>
  {#if error}
    <div class="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive-foreground text-sm">
      <strong>Formatting Error:</strong>
      {error}
    </div>
  {:else}
    <div class="w-full h-full border border-input rounded-lg overflow-auto bg-card">
      {#if value}
        <div id="sql-output" class="h-full m-0 p-4 text-sm">
            <PrismHighlight code={value} language="sql" />
        </div>
      {:else}
        <div class="p-4 text-muted-foreground text-sm font-mono">Formatted SQL will appear here...</div>
      {/if}
    </div>
  {/if}

  {#if value}
    <button
      onclick={handleCopy}
      class="absolute top-10 right-4 p-2 bg-background border border-border rounded-md shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      aria-label="Copy formatted SQL"
    >
      {#if copied}
        <Check size={16} class="text-primary" />
      {:else}
        <Copy size={16} />
      {/if}
    </button>
  {/if}
</div>

<style>
  :global(.language-sql) {
    background: transparent !important;
    padding: 0 !important;
    white-space: pre-wrap !important;
    word-break: break-all;
  }
</style>