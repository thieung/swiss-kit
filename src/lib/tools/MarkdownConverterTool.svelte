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
  let error = $state('');
  let copied = $state(false);

  const converters = {
    'Preview': markdownToHtml,
    'Slack': markdownToSlack,
    'JIRA': markdownToJira,
  };

  // Debounced conversion
  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleInput(value: string) {
    input = value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      convertMarkdown();
    }, 300);
  }

  async function convertMarkdown() {
    if (!input) {
      output = '';
      error = '';
      return;
    }

    try {
      const converter = converters[selectedFormat as keyof typeof converters];
      output = await converter.convert(input);
      error = '';
    } catch (e) {
      error = `Failed to convert ${selectedFormat}: ${(e as Error).message}`;
      output = '';
    }
  }

  function handleFormatChange(format: string) {
    selectedFormat = format;
    convertMarkdown();
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
    error = '';
  }

  const actions = $derived([
    { label: 'Clear', onClick: clearAll, variant: 'secondary' as const },
    {
      label: copied ? 'Copied!' : 'Copy Output',
      onClick: copyOutput,
      variant: 'primary' as const,
      icon: copied ? Check : Copy
    },
  ]);

</script>

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
      {#if error}
        <div class="p-4 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      {/if}
      <ConversionPreview {output} format={selectedFormat} />
    </div>
  </div>
</div>