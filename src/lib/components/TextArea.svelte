<script lang="ts">
  interface Props {
    value: string;
    label: string;
    placeholder?: string;
    readonly?: boolean;
    onInput?: (value: string) => void;
  }

  let { value = $bindable(''), label, placeholder = '', readonly = false, onInput }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    onInput?.(value);
  }
</script>

<div class="flex flex-col gap-2">
  <label for={label} class="text-sm font-medium text-slate-700 select-none">{label}</label>
  <textarea
    id={label}
    {value}
    {placeholder}
    {readonly}
    oninput={handleInput}
    class="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-800 resize-y transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
  ></textarea>
</div>