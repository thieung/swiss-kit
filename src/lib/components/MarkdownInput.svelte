<script lang="ts">
  interface Props {
    value: string;
    placeholder?: string;
    onInput?: (value: string) => void;
    element?: HTMLTextAreaElement;
  }

  let { value = $bindable(''), placeholder = 'Enter Markdown...', onInput, element = $bindable() }: Props = $props();

  const charCount = $derived(value.length);

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    onInput?.(value);
  }
</script>

<div class="flex flex-col h-full flex-1 min-h-0">
  <div class="flex justify-between items-center mb-2">
    <label for="markdown-input" class="text-sm font-medium text-gray-700">Markdown Input</label>
    <span class="text-xs text-gray-500">{charCount} characters</span>
  </div>
  <textarea
    bind:this={element}
    id="markdown-input"
    {value}
    {placeholder}
    oninput={handleInput}
    class="w-full h-full p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  ></textarea>
</div>