<script lang="ts">
  interface Props {
    value: string;
    label?: string;
    placeholder?: string;
    onInput?: (value: string) => void;
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
  <div class="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-white">
    <label for="text-input" class="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
    <span class="text-xs font-mono text-slate-400">{charCount} chars</span>
  </div>
  <textarea
    bind:this={element}
    id="text-input"
    {value}
    {placeholder}
    oninput={handleInput}
    class="w-full h-full p-4 font-mono text-sm text-slate-700 resize-none focus:outline-none bg-transparent leading-relaxed"
  ></textarea>
</div>
