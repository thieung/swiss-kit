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
  <div class="flex justify-between items-center px-4 py-3 border-b border-border bg-card">
    <label for="markdown-input" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Markdown Input</label>
    <span class="text-xs font-mono text-muted-foreground">{charCount} chars</span>
  </div>
  <textarea
    bind:this={element}
    id="markdown-input"
    {value}
    {placeholder}
    oninput={handleInput}
    class="w-full h-full p-4 font-mono text-sm text-foreground resize-none focus:outline-none bg-transparent leading-relaxed"
  ></textarea>
</div>