<script lang="ts">
  import FormatSelector from '$lib/components/FormatSelector.svelte';
  import MarkdownInput from '$lib/components/MarkdownInput.svelte';
  import ConversionPreview from '$lib/components/ConversionPreview.svelte';
  import ToolActions from '$lib/components/ToolActions.svelte';
  import { markdownToSlack } from '$lib/converters/markdown-to-slack';
  import { markdownToJira } from '$lib/converters/markdown-to-jira';
  import { markdownToHtml } from '$lib/converters/markdown-to-html';
  import { copyToClipboard } from '$lib/utils/clipboard';

  let input = $state('');
  let selectedFormat = $state('Preview');
  let output = $state('');

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
    }
  }

  function clearAll() {
    input = '';
    output = '';
  }

  const actions = [
    { label: 'Clear', onClick: clearAll, variant: 'secondary' as const },
    { label: 'Copy Output', onClick: copyOutput, variant: 'primary' as const },
  ];

</script>

<div class="space-y-4">
  <FormatSelector
    bind:selected={selectedFormat}
    formats={Object.keys(converters)}
    onSelect={handleFormatChange}
  />

  <div class="grid grid-cols-2 gap-4 h-[600px]">
    <MarkdownInput bind:value={input} onInput={handleInput} />
    <ConversionPreview {output} format={selectedFormat} />
  </div>

  <ToolActions {actions} />
</div>