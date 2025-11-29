<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props {
    value: string;
    label?: string;
    placeholder?: string;
    onInput?: (value: string) => void;
    type?: HTMLInputAttributes['type'];
  }

  let {
    value = $bindable(''),
    label = 'Input',
    placeholder = 'Enter text...',
    onInput,
    type = 'text'
  }: Props = $props();

  const charCount = $derived(value.length);

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onInput?.(value);
  }
</script>

<div class="flex flex-col h-full flex-1 min-h-0">
  <div class="flex justify-between items-center px-4 py-3 border-b border-border bg-card">
    <label for="text-input" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    <span class="text-xs font-mono text-muted-foreground">{charCount} chars</span>
  </div>
  <div class="flex-1 min-h-0">
    <Input
      id="text-input"
      {placeholder}
      type={type || 'text'}
      bind:value={value}
      oninput={handleInput}
      class="h-full font-mono resize-none"
    />
  </div>
</div>
