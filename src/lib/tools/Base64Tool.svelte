<script lang="ts">
  import FormatSelector from '$lib/components/FormatSelector.svelte';
  import TextInput from '$lib/components/TextInput.svelte';
  import ConversionPreview from '$lib/components/ConversionPreview.svelte';
  import ToolActions from '$lib/components/ToolActions.svelte';
  import { Copy, Check } from 'lucide-svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';

  let input = $state('');
  let selectedFormat = $state('Encode');
  let output = $state('');
  let error = $state('');
  let copied = $state(false);

  const formats = ['Encode', 'Decode'];

  function handleInput(value: string) {
    input = value;
    processInput();
  }

  function processInput() {
    if (!input) {
      output = '';
      error = '';
      return;
    }

    try {
      if (selectedFormat === 'Encode') {
        output = btoa(input);
        error = '';
      } else {
        output = atob(input);
        error = '';
      }
    } catch (e) {
      error = selectedFormat === 'Encode'
        ? 'Failed to encode: ' + (e as Error).message
        : 'Invalid Base64 string';
      output = '';
    }
  }

  function handleFormatChange(format: string) {
    selectedFormat = format;
    processInput();
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
      {formats}
      onSelect={handleFormatChange}
    />
    <div class="flex gap-2">
      <ToolActions {actions} />
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
    <div class="h-full flex flex-col bg-background rounded-xl border border-border shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 transition-shadow duration-200 hover:shadow-md">
      <TextInput
        bind:value={input}
        onInput={handleInput}
        label={selectedFormat === 'Encode' ? 'Text Input' : 'Base64 Input'}
        placeholder={selectedFormat === 'Encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
      />
    </div>

    <div class="h-full flex flex-col bg-muted/50 rounded-xl border border-border shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      {#if error}
        <div class="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm">
          {error}
        </div>
      {/if}
      <ConversionPreview {output} format={selectedFormat === 'Encode' ? 'Base64' : 'Text'} />
    </div>
  </div>
</div>