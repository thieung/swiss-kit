import type { Component } from 'svelte';

export interface Tool {
  id: string;
  name: string;
  description: string;
  component: Component;
  shortcut?: string;
  icon?: any;
}