<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    tool: {
      name: string;
      description: string;
      component: Component;
    };
  }

  let { tool }: Props = $props();
</script>

<div class="max-w-7xl mx-auto">
  <tool.component />
</div>