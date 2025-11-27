<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { WithoutChildrenOrChild, WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		"data-slot": dataSlot = "dialog-body",
		...restProps
	}: WithoutChildrenOrChild<WithElementRef<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		"flex-1 flex-1 py-0 text-left text-sm leading-relaxed",
		className
	)}
	{...restProps}
></div>

<style>
	:global([data-slot="dialog-body"]) {
		max-height: calc(100vh - 8rem);
		overflow-y: auto;
	}
</style>