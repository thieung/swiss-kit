<script lang="ts">
  interface Props {
    selected: string;
    formats: string[];
    onSelect: (format: string) => void;
  }

  let { selected = $bindable(), formats, onSelect }: Props = $props();
</script>

<div class="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
  {#each formats as format}
    <button
      onclick={() => onSelect(format)}
      class={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        selected === format
          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
      }`}
    >
      {format}
    </button>
  {/each}
</div>