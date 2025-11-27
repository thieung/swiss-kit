<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { WithoutChildrenOrChild, WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		"data-slot": dataSlot = "dialog-footer",
		...restProps
	}: WithoutChildrenOrChild<WithElementRef<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		"flex items-center border-t bg-background px-6 py-4",
		className
	)}
	{...restProps}
></div>