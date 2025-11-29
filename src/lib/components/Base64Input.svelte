<script lang="ts">
  import { Textarea } from '$lib/components/ui/textarea';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props {
    value: string;
    label?: string;
    placeholder?: string;
    onInput?: (value: string) => void;
    type?: HTMLTextareaAttributes['type'];
    element?: HTMLTextAreaElement;
  }

  let {
    value = $bindable(''),
    label = 'Input',
    placeholder = 'Enter text...',
    onInput,
    element = $bindable()
  }: Props = $props();

  const charCount = $derived(value.length);

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    onInput?.(value);
  }
</script>

<div class="flex flex-col h-full flex-1 min-h-0">
  <div class="flex justify-between items-center px-4 py-3 border-b border-border bg-card">
    <label for="base64-input" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    <span class="text-xs font-mono text-muted-foreground">{charCount} chars</span>
  </div>
  <div class="flex-1 min-h-0">
    <Textarea
      bind:this={element}
      id="base64-input"
      {placeholder}
      bind:value={value}
      oninput={handleInput}
      class="h-full font-mono resize-none border-0 focus-visible:ring-0 shadow-none"
    />
  </div>
</div>