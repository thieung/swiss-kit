<script lang="ts">
  import { Textarea } from '$lib/components/ui/textarea';
  import { Copy, Check, FileText } from 'lucide-svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';

  interface Props {
    value: string;
    onInput: (value: string) => void;
    placeholder?: string;
  }

  let {
    value = $bindable(''),
    onInput,
    placeholder = 'Enter Markdown to convert...'
  }: Props = $props();

  const charCount = $derived(value.length);
  const lineCount = $derived(value ? value.split('\n').length : 0);
  let copied = $state(false);
  let copyAnnouncement = $state('');

  async function copySource() {
    if (!value?.trim()) {
      copyAnnouncement = 'Nothing to copy';
      setTimeout(() => copyAnnouncement = '', 2000);
      return;
    }

    try {
      await copyToClipboard(value);
      copied = true;
      copyAnnouncement = 'Markdown source copied to clipboard';
      setTimeout(() => {
        copied = false;
        copyAnnouncement = '';
      }, 2000);
    } catch (error) {
      copyAnnouncement = 'Failed to copy to clipboard';
      setTimeout(() => copyAnnouncement = '', 3000);
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    onInput?.(value);
  }

  // Keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    // Cmd/Ctrl + C when no selection
    if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !window.getSelection()?.toString()) {
      e.preventDefault();
      copySource();
    }
    // Cmd/Ctrl + A for select all
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      // Let default behavior handle select all
      setTimeout(() => {
        const textarea = e.target as HTMLTextAreaElement;
        textarea?.select();
      }, 0);
    }
  }
</script>

<div class="h-full flex flex-col bg-background rounded-xl border border-border shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 transition-shadow duration-200 hover:shadow-md">
  <!-- Header -->
  <div class="flex justify-between items-center px-4 py-3 border-b border-border bg-card">
    <div class="flex items-center gap-2">
      <FileText size={16} class="text-muted-foreground" />
      <label for="markdown-source" class="text-sm font-medium text-foreground">Markdown Source</label>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{charCount} chars</span>
        <span>•</span>
        <span>{lineCount} lines</span>
      </div>
      <button
        onclick={copySource}
        class="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        class:text-muted-foreground={!copied}
        class:text-green-600={copied}
        disabled={!value}
        aria-label="Copy Markdown source to clipboard"
      >
        {#if copied}
          <Check size={16} />
          <span>Copied!</span>
        {:else}
          <Copy size={16} />
          <span>Copy</span>
        {/if}
      </button>
    </div>
  </div>

  <!-- Textarea -->
  <div class="flex-1 p-4">
    <Textarea
      id="markdown-source"
      bind:value
      oninput={handleInput}
      onkeydown={handleKeydown}
      {placeholder}
      class="h-full font-mono text-sm resize-none border-0 focus-visible:ring-0 shadow-none p-0"
      aria-label="Markdown input area"
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
    />
  </div>
</div>

<!-- Screen reader announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {copyAnnouncement}
</div>