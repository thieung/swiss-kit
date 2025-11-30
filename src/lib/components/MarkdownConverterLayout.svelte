<script lang="ts">
  import MarkdownSourceInput from './MarkdownSourceInput.svelte';
  import FormatTabs from './FormatTabs.svelte';
  import ConversionPreview from './ConversionPreview.svelte';
  import ToolActions from './ToolActions.svelte';

  interface Props {
    input: string;
    selectedFormat: string;
    output: string;
    formatOutputs: Record<string, string>;
    onInput: (value: string) => void;
    onFormatChange: (format: string) => void;
    onClear: () => void;
    onCopyAll: () => void;
    onExport: () => void;
  }

  let {
    input,
    selectedFormat,
    output,
    formatOutputs,
    onInput,
    onFormatChange,
    onClear,
    onCopyAll,
    onExport
  }: Props = $props();

  // Enhanced tool actions
  const actions = $derived([
    {
      label: 'Clear All',
      onClick: onClear,
      variant: 'secondary' as const,
      disabled: !input && !output,
      title: 'Clear all content (Cmd+K)'
    },
    {
      label: 'Copy All',
      onClick: onCopyAll,
      variant: 'primary' as const,
      disabled: !input && !output,
      title: 'Copy all formats (Cmd+Shift+C)'
    },
    {
      label: 'Export',
      onClick: onExport,
      variant: 'outline' as const,
      disabled: !input && !output,
      title: 'Export as markdown file (Cmd+S)'
    }
  ]);
</script>

<div class="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
  <!-- Header: Format Tabs and Actions -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
    <FormatTabs selected={selectedFormat} onSelect={onFormatChange} />
    <div class="flex gap-2">
      <ToolActions {actions} />
    </div>
  </div>

  <!-- Main Content: Split Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
    <!-- Left Panel: Markdown Source -->
    <MarkdownSourceInput
      bind:value={input}
      onInput={onInput}
      placeholder="Enter Markdown to convert...
Try headers, lists, code blocks, and more!"
    />

    <!-- Right Panel: Preview -->
    <ConversionPreview
      {output}
      format={selectedFormat}
      {formatOutputs}
    />
  </div>
</div>