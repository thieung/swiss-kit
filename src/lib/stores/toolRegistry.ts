import Base64Tool from '$lib/tools/Base64Tool.svelte';
import type { Tool } from '$lib/types/tool';

export const tools: Tool[] = [
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    component: Base64Tool,
    shortcut: 'Cmd+Shift+B',
    icon: '🔤',
  },
];