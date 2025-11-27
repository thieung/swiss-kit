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
    <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="sql-output">Formatted SQL</label>
    <span class="text-xs text-slate-500 dark:text-slate-400">{lineCount} lines, {charCount} chars</span>
  </div>
  {#if error}
    <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
      <strong>Formatting Error:</strong>
      {error}
    </div>
  {:else}
    <div class="w-full h-full border border-slate-300 dark:border-slate-600 rounded-lg overflow-auto bg-slate-800 dark:bg-slate-50">
      {#if value}
        <div id="sql-output" class="h-full m-0 p-4 text-sm">
            <PrismHighlight code={value} language="sql" />
        </div>
      {:else}
        <div class="p-4 text-slate-400 dark:text-slate-500 text-sm font-mono">Formatted SQL will appear here...</div>
      {/if}
    </div>
  {/if}

  {#if value}
    <button
      onclick={handleCopy}
      class="absolute top-10 right-4 p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      aria-label="Copy formatted SQL"
    >
      {#if copied}
        <Check size={16} class="text-green-600 dark:text-green-400" />
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