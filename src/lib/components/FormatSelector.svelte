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
  <Tabs.List class="bg-muted border border-border h-auto p-1">
    {#each formats as format}
      <Tabs.Trigger
        value={format}
        class="flex-1 px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-ring/5 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground hover:data-[state=inactive]:bg-accent/50"
      >
        {format}
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>