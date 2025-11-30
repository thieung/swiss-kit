<script lang="ts">
  import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
  import { Eye, FileCode, MessageSquare, Code } from 'lucide-svelte';

  interface Props {
    selected: string;
    onSelect: (format: string) => void;
  }

  let { selected, onSelect }: Props = $props();

  const formats = [
    {
      value: 'Preview',
      label: 'Preview',
      description: 'Rendered HTML with syntax highlighting'
    },
    {
      value: 'JIRA',
      label: 'Jira',
      description: 'Jira markup format'
    },
    {
      value: 'Slack',
      label: 'Slack',
      description: 'Slack markdown format'
    },
    {
      value: 'HTML',
      label: 'HTML',
      description: 'Raw HTML output'
    }
  ];

  function handleTabChange(e: Event & { detail: string }) {
    onSelect(e.detail);
  }
</script>

<Tabs value={selected} on:change={handleTabChange}>
  <TabsList class="grid w-full grid-cols-4 h-9">
    {#each formats as format, i}
      <TabsTrigger
        value={format.value}
        class="text-xs font-medium gap-1 data-[state=active]:shadow-sm"
        title={format.description}
      >
        {#if i === 0}
          <Eye size={14} />
        {:else if i === 1}
          <FileCode size={14} />
        {:else if i === 2}
          <MessageSquare size={14} />
        {:else if i === 3}
          <Code size={14} />
        {/if}
        <span class="hidden sm:inline">{format.label}</span>
      </TabsTrigger>
    {/each}
  </TabsList>
</Tabs>