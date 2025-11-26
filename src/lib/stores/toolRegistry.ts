import Base64Tool from '$lib/tools/Base64Tool.svelte';
import MarkdownConverterTool from '$lib/tools/MarkdownConverterTool.svelte';
import { Binary, FileText } from 'lucide-svelte';

export interface Tool {
  id: string;
  name: string;
  description: string;
  component: any;
  shortcut?: string;
  icon: any;
  category: 'converters' | 'encoders' | 'formatters' | 'generators' | 'utils';
}

export const tools: Tool[] = [
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    component: Base64Tool,
    shortcut: 'Cmd+Shift+B',
    icon: Binary,
    category: 'encoders',
  },
  {
    id: 'markdown-converter',
    name: 'Markdown Converter',
    description: 'Convert Markdown to Slack or JIRA format',
    component: MarkdownConverterTool,
    shortcut: 'Cmd+Shift+M',
    icon: FileText,
    category: 'converters',
  },
];