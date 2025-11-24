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
  <div class="mb-8">
    <h1 class="text-3xl font-bold tracking-tight text-slate-900">{tool.name}</h1>
    <p class="text-lg text-slate-600 mt-2">{tool.description}</p>
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="p-6 sm:p-8">
      <tool.component />
    </div>
  </div>
</div>