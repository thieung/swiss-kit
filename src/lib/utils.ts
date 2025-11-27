import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export type { ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// shadcn-svelte type utilities
export type WithElementRef<T extends HTMLElement = HTMLElement> = T & {
	element?: T;
}

export type WithoutChildrenOrChild = {
	children?: never;
	child?: never;
}