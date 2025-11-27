<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import type { Component } from 'svelte';

  interface Props {
    actions: Array<{ label: string; onClick: () => void | Promise<void>; variant?: 'primary' | 'secondary'; icon?: Component<any> }>;
    alignment?: 'left' | 'center' | 'right';
  }

  let { actions, alignment = 'right' }: Props = $props();

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };
</script>

<div class={`flex flex-wrap gap-3 ${alignmentClasses[alignment]}`}>
  {#each actions as action}
    <Button
      onclick={action.onClick}
      variant={action.variant === 'primary' ? 'default' : 'outline'}
      class="flex items-center gap-2"
    >
      {#if action.icon}
        <action.icon size={18} />
      {/if}
      {action.label}
    </Button>
  {/each}
</div>