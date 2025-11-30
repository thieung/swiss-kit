<script lang="ts">
  import { Copy, Check, Eye, FileCode, MessageSquare, Code, Loader2, AlertCircle } from 'lucide-svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';
  import { enhancedMarkdownToHtml } from '$lib/converters/enhanced-markdown-to-html';
  import type { MarkdownConverter } from '$lib/converters/types';
  import DOMPurify from 'dompurify';

  interface Props {
    output: string;
    format: string;
    formatOutputs: Record<string, string>;
  }

  let { output, format, formatOutputs = {} }: Props = $props();

  const charCount = $derived(output.length);
  let copiedFormats = $state<Record<string, boolean>>({});
  let copyAllCopied = $state(false);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let copyAnnouncement = $state('');

  // Format icons
  const formatIcons = {
    Preview: Eye,
    JIRA: FileCode,
    Slack: MessageSquare,
    HTML: Code
  };

  // Enhanced async rendering for preview format with XSS protection
  async function renderPreview(input: string): Promise<string> {
    if (format !== 'Preview') return formatOutputs[format] || '';

    loading = true;
    error = null;

    try {
      const result = await enhancedMarkdownToHtml.convert(input);
      // Sanitize HTML to prevent XSS attacks
      const sanitized = DOMPurify.sanitize(result, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'em', 'strong', 'del', 'hr', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'img'],
        ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'data-language', 'data-theme'],
        ALLOW_DATA_ATTR: true
      });
      return sanitized;
    } catch (e) {
      error = `Preview rendering failed: ${(e as Error).message}`;
      return '';
    } finally {
      loading = false;
    }
  }

  // Get output for current format
  const currentOutput = $derived(async () => {
    if (format === 'Preview') {
      return await renderPreview(output);
    }
    return formatOutputs[format] || '';
  });

  // Copy functionality for individual formats
  async function copyFormat(formatName: string) {
    const formatOutput = formatName === 'Preview'
      ? await currentOutput
      : formatOutputs[formatName];

    if (!formatOutput?.trim()) {
      copyAnnouncement = `No content in ${formatName} format`;
      setTimeout(() => copyAnnouncement = '', 2000);
      return;
    }

    try {
      await copyToClipboard(formatOutput);
      copiedFormats[formatName] = true;
      copyAnnouncement = `${formatName} format copied to clipboard`;
      setTimeout(() => {
        copiedFormats[formatName] = false;
        copyAnnouncement = '';
      }, 2000);
    } catch (e) {
      copyAnnouncement = `Failed to copy ${formatName} format`;
      setTimeout(() => copyAnnouncement = '', 3000);
    }
  }

  // Copy all formats in one action
  async function copyAllFormats() {
    const allFormats = ['Preview', 'JIRA', 'Slack', 'HTML'];
    let allContent = '';

    for (const fmt of allFormats) {
      const formatOutput = fmt === 'Preview'
        ? await currentOutput
        : formatOutputs[fmt];

      if (formatOutput?.trim()) {
        allContent += `=== ${fmt.toUpperCase()} ===\n${formatOutput}\n\n`;
      }
    }

    if (!allContent.trim()) {
      copyAnnouncement = 'No content to copy';
      setTimeout(() => copyAnnouncement = '', 2000);
      return;
    }

    try {
      await copyToClipboard(allContent.trim());
      copyAllCopied = true;
      copyAnnouncement = 'All formats copied to clipboard';
      setTimeout(() => {
        copyAllCopied = false;
        copyAnnouncement = '';
      }, 2000);
    } catch (e) {
      copyAnnouncement = 'Failed to copy all formats';
      setTimeout(() => copyAnnouncement = '', 3000);
    }
  }

  // Keyboard shortcuts for copy actions
  function handleKeydown(e: KeyboardEvent) {
    const formatKeys: Record<string, string> = {
      '1': 'Preview',
      '2': 'JIRA',
      '3': 'Slack',
      '4': 'HTML'
    };

    if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
      if (e.key === 'a') {
        e.preventDefault();
        copyAllFormats();
      } else if (formatKeys[e.key]) {
        e.preventDefault();
        copyFormat(formatKeys[e.key]);
      }
    }
  }

  // Format-specific styling
  const formatStyles = {
    Preview: 'prose prose-sm max-w-none prose-slate prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-code:text-pink-600 prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
    JIRA: 'font-mono text-sm leading-relaxed whitespace-pre-wrap p-4 bg-muted/30 rounded-lg',
    Slack: 'font-sans text-sm leading-relaxed whitespace-pre-wrap p-4 bg-muted/30 rounded-lg',
    HTML: 'font-mono text-sm leading-relaxed whitespace-pre-wrap p-4 bg-muted/30 rounded-lg'
  };

  // Empty state messages
  const emptyStates = {
    Preview: 'Preview will appear here...',
    JIRA: 'Jira markup will appear here...',
    Slack: 'Slack markup will appear here...',
    HTML: 'HTML output will appear here...'
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-full flex flex-col bg-muted/50 rounded-xl border border-border shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
  <!-- Header -->
  <div class="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/80">
    <div class="flex items-center gap-2">
      <svelte:component this={formatIcons[format]} size={16} class="text-muted-foreground" />
      <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{format} Output</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs font-mono text-muted-foreground">{charCount} chars</span>

      <!-- Format-specific copy buttons -->
      {#each ['Preview', 'JIRA', 'Slack', 'HTML'] as fmt, idx}
        <button
          onclick={() => copyFormat(fmt)}
          class="flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50 px-2 py-1 rounded hover:bg-muted"
          class:bg-muted={fmt === format}
          class:text-muted-foreground={!copiedFormats[fmt]}
          class:text-green-600={copiedFormats[fmt]}
          disabled={!formatOutputs[fmt] && fmt !== 'Preview'}
          aria-label={`Copy ${fmt} format to clipboard`}
          title={`Copy ${fmt} format (Cmd+Shift+${idx + 1})`}
        >
          {#if copiedFormats[fmt]}
            <Check size={14} />
          {:else}
            <Copy size={14} />
          {/if}
          <span class="hidden sm:inline">{fmt}</span>
        </button>
      {/each}

      <!-- Copy all button -->
      <button
        onclick={copyAllFormats}
        class="flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
        aria-label="Copy all formats to clipboard"
        title="Copy all formats (Cmd+Shift+A)"
      >
        {#if copyAllCopied}
          <Check size={16} />
        {:else}
          <Copy size={16} />
        {/if}
        <span>All</span>
      </button>
    </div>
  </div>

  <!-- Content Area -->
  <div class="flex-1 min-h-0">
    {#if loading}
      <div class="flex items-center justify-center h-full">
        <div class="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={20} class="animate-spin" />
          <span class="text-sm">Rendering preview...</span>
        </div>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-full p-8">
        <div class="flex flex-col items-center text-center max-w-md">
          <AlertCircle size={48} class="text-destructive mb-4" />
          <p class="text-destructive font-medium mb-2">Rendering Error</p>
          <p class="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    {:else}
      <div class="w-full h-full p-4 overflow-auto">
        {#await currentOutput then renderedOutput}
          {#if renderedOutput}
            {#if format === 'Preview'}
              <div class={formatStyles.Preview}>
                {@html renderedOutput}
              </div>
            {:else}
              <div class={formatStyles[format]}>
                {renderedOutput}
              </div>
            {/if}
          {:else}
            <div class="flex items-center justify-center h-full text-center">
              <p class="text-muted-foreground italic">{emptyStates[format]}</p>
            </div>
          {/if}
        {:catch error}
          <div class="flex items-center justify-center h-full p-8">
            <div class="flex flex-col items-center text-center max-w-md">
              <AlertCircle size={48} class="text-destructive mb-4" />
              <p class="text-destructive font-medium mb-2">Display Error</p>
              <p class="text-muted-foreground text-sm">{error.message}</p>
            </div>
          </div>
        {/await}
      </div>
    {/if}
  </div>
</div>

<!-- Screen reader announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {copyAnnouncement}
</div>