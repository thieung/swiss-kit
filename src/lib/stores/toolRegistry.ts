import Base64Tool from '$lib/tools/Base64Tool.svelte';
import MarkdownConverterTool from '$lib/tools/MarkdownConverterTool.svelte';
import type { Tool } from '$lib/types/tool';
import { Binary, FileText } from 'lucide-svelte';

export const tools: Tool[] = [
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    component: Base64Tool,
    shortcut: 'Cmd+Shift+B',
    icon: Binary,
  },
  {
    id: 'markdown-converter',
    name: 'Markdown Converter',
    description: 'Convert Markdown to Slack or JIRA format',
    component: MarkdownConverterTool,
    shortcut: 'Cmd+Shift+M',
    icon: FileText,
  },
];