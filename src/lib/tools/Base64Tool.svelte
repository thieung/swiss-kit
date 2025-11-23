<script lang="ts">
  import TextArea from '$lib/components/TextArea.svelte';
  import ToolActions from '$lib/components/ToolActions.svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';

  let input = $state('');
  let output = $state('');
  let error = $state('');

  function encodeBase64() {
    try {
      output = btoa(input);
      error = '';
    } catch (e) {
      error = 'Failed to encode: ' + (e as Error).message;
      output = '';
    }
  }

  function decodeBase64() {
    try {
      output = atob(input);
      error = '';
    } catch (e) {
      error = 'Invalid Base64 string';
      output = '';
    }
  }

  async function copyOutput() {
    if (output) {
      await copyToClipboard(output);
      // Show feedback (could add toast notification)
    }
  }

  const actions = [
    { label: 'Encode', onClick: encodeBase64, variant: 'primary' as const },
    { label: 'Decode', onClick: decodeBase64, variant: 'primary' as const },
    { label: 'Copy Output', onClick: copyOutput, variant: 'secondary' as const },
  ];
</script>

<div class="space-y-4">
  <TextArea bind:value={input} label="Input" placeholder="Enter text to encode or Base64 to decode" />

  <ToolActions {actions} />

  {#if error}
    <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
      {error}
    </div>
  {/if}

  <TextArea bind:value={output} label="Output" readonly={true} />
</div>