<script lang="ts">
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
    <button
      onclick={action.onClick}
      class={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 ${
        action.variant === 'primary'
          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md hover:shadow-indigo-500/20'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
      }`}
    >
      {#if action.icon}
        <action.icon size={18} />
      {/if}
      {action.label}
    </button>
  {/each}
</div>