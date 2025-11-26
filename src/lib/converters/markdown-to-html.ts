import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';

/**
 * Normalizes language aliases to supported Prism.js languages
 * @param lang - The language identifier to normalize
 * @returns Normalized language name or null if unsupported
 */
function normalizeLanguage(lang: string): string | null {
  if (!lang) return null;

  const aliases: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'sh': 'bash',
    'shell': 'bash',
    'md': 'markdown',
    'yml': 'yaml',
    'json5': 'json',
  };

  // Convert to lowercase for case-insensitive matching
  const normalized = aliases[lang.toLowerCase()] || lang.toLowerCase();
  return normalized;
}

/**
 * Escapes HTML characters in unstyled code blocks
 * @param text - The code text to escape
 * @returns HTML-escaped text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Configure marked renderer for syntax highlighting
const renderer = new marked.Renderer();

renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  if (lang) {
    const normalizedLang = normalizeLanguage(lang);
    const grammar = normalizedLang ? Prism.languages[normalizedLang] : null;

    if (grammar && normalizedLang) {
      try {
        const highlighted = Prism.highlight(text, grammar, normalizedLang);
        return `<pre><code class="language-${normalizedLang}">${highlighted}</code></pre>`;
      } catch (err) {
        console.error('Prism highlight error:', err);
        // Fallback to unstyled on error
      }
    }
  }

  // Unstyled fallback (no auto-detection)
  const escaped = escapeHtml(text);
  return `<pre><code>${escaped}</code></pre>`;
};

marked.use({ renderer });

export const markdownToHtml = {
  convert(input: string): string {
    if (!input) return '';
    return marked.parse(input) as string;
  }
};