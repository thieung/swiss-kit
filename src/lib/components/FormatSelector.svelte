<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs';

  interface Props {
    selected: string;
    formats: string[];
    onSelect: (format: string) => void;
  }

  let { selected = $bindable(), formats, onSelect }: Props = $props();

  // Handle tab change and notify parent
  function handleValueChange(value: string) {
    selected = value;
    onSelect(value);
  }
</script>

<Tabs.Root value={selected} onValueChange={handleValueChange}>
  <Tabs.List class="bg-slate-100 border border-slate-200 h-auto p-1">
    {#each formats as format}
      <Tabs.Trigger
        value={format}
        class="flex-1 px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-black/5 data-[state=inactive]:text-slate-500 hover:data-[state=inactive]:text-slate-900 hover:data-[state=inactive]:bg-slate-200/50"
      >
        {format}
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>