<script lang="ts">
  import { Textarea } from '$lib/components/ui/textarea';

  interface Props {
    value: string;
    label: string;
    placeholder?: string;
    readonly?: boolean;
    onInput?: (value: string) => void;
  }

  let { value = $bindable(''), label, placeholder = '', readonly = false, onInput }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <label for={label} class="text-sm font-medium text-slate-700 select-none">{label}</label>
  <Textarea
    id={label}
    {placeholder}
    {readonly}
    bind:value={value}
    oninput={onInput}
    class="h-48 font-mono resize-y"
  />
</div>