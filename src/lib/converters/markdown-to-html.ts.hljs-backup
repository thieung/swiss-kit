import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked renderer for syntax highlighting
const renderer = new marked.Renderer();

renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch (err) {
      console.error('Highlight error:', err);
    }
  }
  const highlighted = hljs.highlightAuto(text).value;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
};

marked.use({ renderer });

export const markdownToHtml = {
  convert(input: string): string {
    if (!input) return '';
    return marked.parse(input) as string;
  }
};
