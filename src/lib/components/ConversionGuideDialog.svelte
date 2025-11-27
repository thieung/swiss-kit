<script lang="ts">
  import { X } from 'lucide-svelte';
  import * as Dialog from '$lib/components/ui/dialog';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen = $bindable(), onClose }: Props = $props();

  const conversions = [
    { markdown: '# Heading', slack: '*Heading*', description: 'All heading levels (H1-H6)' },
    { markdown: '**Bold**', slack: '*Bold*', description: 'Bold text' },
    { markdown: '__Bold__', slack: '*Bold*', description: 'Alternative bold syntax' },
    { markdown: '*Italic*', slack: '_Italic_', description: 'Italic text' },
    { markdown: '***Bold Italic***', slack: '*_Bold Italic_*', description: 'Combined bold and italic' },
    { markdown: '~~Strikethrough~~', slack: '~Strikethrough~', description: 'Strikethrough text' },
    { markdown: '[Link](https://example.com)', slack: '<https://example.com|Link>', description: 'Hyperlinks' },
    { markdown: '![Image](https://example.com/img.png)', slack: '<https://example.com/img.png>', description: 'Images (converted to URL)' },
    { markdown: '- List item', slack: '• List item', description: 'Unordered lists' },
    { markdown: '1. Ordered item', slack: '1. Ordered item', description: 'Ordered lists' },
    { markdown: '- [ ] Task', slack: '• ☐ Task', description: 'Unchecked task' },
    { markdown: '- [x] Task', slack: '• ☑ Task', description: 'Checked task' },
    { markdown: '> Quote', slack: '> Quote', description: 'Blockquotes' },
    { markdown: '`Code`', slack: '`Code`', description: 'Inline code' },
    { markdown: '```python', slack: '```python', description: 'Code blocks (language preserved)' },
    { markdown: '---', slack: '──────────', description: 'Horizontal rule' },
  ];
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Content class="max-w-4xl max-h-[90vh] flex flex-col">
    <Dialog.Header>
      <Dialog.Title>Markdown to Slack mrkdwn Conversion Guide</Dialog.Title>
      <Dialog.Close onclick={onClose}>
        <X size={24} />
      </Dialog.Close>
    </Dialog.Header>

    <Dialog.Body class="overflow-y-auto p-6">
      <Dialog.Description class="text-gray-600 mb-6">
        This tool converts standard Markdown syntax to Slack mrkdwn format. Below are the supported conversions:
      </Dialog.Description>

      <div class="space-y-4">
        {#each conversions as conversion}
          <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="text-xs font-semibold text-gray-500 uppercase mb-1">Markdown</div>
                  <code class="block bg-gray-50 px-3 py-2 rounded text-sm font-mono text-gray-800 border border-gray-200">
                    {conversion.markdown}
                  </code>
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-500 uppercase mb-1">Slack mrkdwn</div>
                  <code class="block bg-blue-50 px-3 py-2 rounded text-sm font-mono text-blue-800 border border-blue-200">
                    {conversion.slack}
                  </code>
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-2">{conversion.description}</p>
            </div>
          {/each}
        </div>

        <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Nested lists are supported with proper indentation</li>
            <li>Code blocks preserve language specifications</li>
            <li>Multiple formatting styles can be combined</li>
            <li>Based on <a href="https://github.com/fla9ua/markdown_to_mrkdwn" target="_blank" rel="noopener noreferrer" class="underline hover:text-blue-600">fla9ua/markdown_to_mrkdwn</a></li>
          </ul>
        </div>
    </Dialog.Body>

    <Dialog.Footer class="border-t border-gray-200 p-6">
      <button
          onclick={onClose}
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Got it!
        </button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
