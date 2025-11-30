<script lang="ts">
  import FormatSelector from '$lib/components/FormatSelector.svelte';
  import Base64Input from '$lib/components/Base64Input.svelte';
  import ConversionPreview from '$lib/components/ConversionPreview.svelte';
  import ToolActions from '$lib/components/ToolActions.svelte';
  import { markdownToSlack } from '$lib/converters/markdown-to-slack';
  import { markdownToJira } from '$lib/converters/markdown-to-jira';
  import { markdownToHtml } from '$lib/converters/markdown-to-html';
  import { Copy, Check } from 'lucide-svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';

  let input = $state('');
  let selectedFormat = $state('Preview');
  let output = $state('');
  let formatOutputs = $state<Record<string, string>>({});
  let error = $state('');
  let copied = $state(false);
  let conversionInProgress = $state(false);
  let conversionErrors = $state<Record<string, string>>({});
  let lastConvertedInput = $state('');
  let conversionCache = $state<Record<string, { input: string; output: string }>>({});

  const converters = {
    'Preview': markdownToHtml,
    'Slack': markdownToSlack,
    'JIRA': markdownToJira,
    'HTML': markdownToHtml,
  };

  // Debounced conversion with improved performance
  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleInput(value: string) {
    input = value;
    clearTimeout(debounceTimer);

    // Clear errors immediately
    conversionErrors = {};
    error = '';

    debounceTimer = setTimeout(() => {
      convertAllFormats();
    }, 300);
  }

  // Enhanced conversion with caching and parallel processing
  async function convertAllFormats() {
    if (!input.trim()) {
      output = '';
      formatOutputs = {};
      conversionErrors = {};
      error = '';
      return;
    }

    // Skip conversion if input hasn't changed
    if (input === lastConvertedInput && Object.keys(formatOutputs).length > 0) {
      return;
    }

    conversionInProgress = true;

    try {
      // Convert all formats in parallel
      const conversionPromises = Object.entries(converters).map(async ([format, converter]) => {
        try {
          // Check cache first with hash-based key to prevent collisions
          const cacheKey = `${format}:${input.length}:${input.substring(0, 50)}:${input.substring(input.length - 50)}`;
          if (conversionCache[cacheKey]?.input === input) {
            return [format, conversionCache[cacheKey].output, null];
          }

          const result = await converter.convert(input);

          // Cache the result
          conversionCache[cacheKey] = { input, output: result };

          // Limit cache size (keep last 50 entries)
          const cacheEntries = Object.entries(conversionCache);
          if (cacheEntries.length > 50) {
            const entriesToRemove = cacheEntries.slice(0, cacheEntries.length - 50);
            entriesToRemove.forEach(([key]) => delete conversionCache[key]);
          }

          return [format, result, null];
        } catch (error) {
          return [format, '', error];
        }
      });

      const results = await Promise.all(conversionPromises);
      const newOutputs: Record<string, string> = {};
      const newErrors: Record<string, string> = {};

      results.forEach(([format, result, conversionError]) => {
        if (conversionError) {
          newErrors[format as string] = `Failed to convert ${format}: ${(conversionError as Error).message}`;
          if (format === selectedFormat) {
            error = newErrors[format as string];
            output = '';
          }
        } else {
          newOutputs[format as string] = result as string;
          if (format === selectedFormat) {
            output = result as string;
            error = '';
          }
        }
      });

      formatOutputs = newOutputs;
      conversionErrors = newErrors;
      lastConvertedInput = input;

    } catch (e) {
      console.error('Conversion batch error:', e);
      error = `Conversion failed: ${(e as Error).message}`;
      output = '';
    } finally {
      conversionInProgress = false;
    }
  }

  // Enhanced format change handler
  async function handleFormatChange(format: string) {
    selectedFormat = format;

    // Update output display from existing formatOutputs
    if (conversionErrors[format]) {
      error = conversionErrors[format];
      output = '';
    } else {
      output = formatOutputs[format] || '';
      error = '';
    }
  }

  async function copyOutput() {
    if (output) {
      await copyToClipboard(output);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }
  }

  function clearAll() {
    input = '';
    output = '';
    formatOutputs = {};
    error = '';
    conversionErrors = {};
    lastConvertedInput = '';
  }

  async function copyAllFormats() {
    const allFormats = ['Preview', 'JIRA', 'Slack', 'HTML'];
    let allContent = '';

    // Add markdown source
    if (input.trim()) {
      allContent += `=== MARKDOWN SOURCE ===\n${input}\n\n`;
    }

    // Add all converted formats
    allFormats.forEach(format => {
      const formatOutput = formatOutputs[format];
      if (formatOutput?.trim()) {
        allContent += `=== ${format.toUpperCase()} ===\n${formatOutput}\n\n`;
      }
    });

    if (!allContent.trim()) {
      return;
    }

    try {
      await copyToClipboard(allContent.trim());
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (error) {
      console.error('Copy all failed:', error);
    }
  }

  async function exportAsFile() {
    const allFormats = ['Preview', 'JIRA', 'Slack', 'HTML'];
    let content = '';

    if (input.trim()) {
      content += `# Markdown Converter Export\n\n## Source\n\`\`\`markdown\n${input}\n\`\`\`\n\n`;
    }

    allFormats.forEach(format => {
      const formatOutput = formatOutputs[format];
      if (formatOutput?.trim()) {
        content += `## ${format}\n\`\`\`${format.toLowerCase() === 'preview' ? 'html' : format.toLowerCase()}\n${formatOutput}\n\`\`\`\n\n`;
      }
    });

    if (!content.trim()) return;

    // Create download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markdown-conversion-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const actions = $derived([
    {
      label: 'Clear All',
      onClick: clearAll,
      variant: 'secondary' as const,
      disabled: !input && !output,
      title: 'Clear all content (Cmd+K)'
    },
    {
      label: copied ? 'Copied!' : 'Copy All',
      onClick: copyAllFormats,
      variant: 'primary' as const,
      icon: copied ? Check : Copy,
      disabled: !input && !output,
      title: 'Copy all formats (Cmd+Shift+C)'
    },
    {
      label: 'Export',
      onClick: exportAsFile,
      variant: 'outline' as const,
      disabled: !input && !output,
      title: 'Export as markdown file (Cmd+S)'
    }
  ]);

  // Global keyboard shortcuts
  function handleGlobalKeydown(e: KeyboardEvent) {
    // Cmd/Ctrl + K: Clear
    if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !e.shiftKey) {
      e.preventDefault();
      clearAll();
    }
    // Cmd/Ctrl + Shift + C: Copy all
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
      e.preventDefault();
      copyAllFormats();
    }
    // Cmd/Ctrl + S: Export
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && !e.shiftKey) {
      e.preventDefault();
      exportAsFile();
    }
  }

  // Cleanup debounce timer on unmount
  $effect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  });
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="max-w-6xl mx-auto space-y-6">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <FormatSelector
      bind:selected={selectedFormat}
      formats={Object.keys(converters)}
      onSelect={handleFormatChange}
    />
    <div class="flex gap-2">
      <ToolActions {actions} />
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
    <div class="h-full flex flex-col bg-background rounded-xl border border-border shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 transition-shadow duration-200 hover:shadow-md">
      <Base64Input
        bind:value={input}
        onInput={handleInput}
        label="Markdown Input"
        placeholder="Enter Markdown to convert..."
      />
    </div>

    <div class="h-full flex flex-col bg-muted/50 rounded-xl border border-border shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      {#if conversionInProgress}
        <div class="p-2 bg-muted/50 border-b border-border text-xs text-muted-foreground flex items-center gap-2">
          <div class="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
          Converting...
        </div>
      {/if}
      {#if error}
        <div class="p-4 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      {/if}
      <ConversionPreview {output} format={selectedFormat} {formatOutputs} />
    </div>
  </div>
</div>