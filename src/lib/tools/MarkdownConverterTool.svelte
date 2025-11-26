<script lang="ts">
  import FormatSelector from '$lib/components/FormatSelector.svelte';
  import MarkdownInput from '$lib/components/MarkdownInput.svelte';
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

  function convertMarkdown() {
    const converter = converters[selectedFormat as keyof typeof converters];
    output = converter.convert(input);
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
    <div class="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 transition-shadow duration-200 hover:shadow-md">
      <MarkdownInput bind:value={input} onInput={handleInput} />
    </div>

    <div class="h-full flex flex-col bg-slate-50/50 rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <ConversionPreview {output} format={selectedFormat} />
    </div>
  </div>
</div>