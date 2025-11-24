<script lang="ts">
  interface Props {
    selected: string;
    formats: string[];
    onSelect: (format: string) => void;
  }

  let { selected = $bindable(), formats, onSelect }: Props = $props();
</script>

<div class="flex gap-2 border-b border-gray-200">
  {#each formats as format}
    <button
      onclick={() => onSelect(format)}
      class={`px-4 py-2 font-medium transition-colors ${
        selected === format
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {format}
    </button>
  {/each}
</div>