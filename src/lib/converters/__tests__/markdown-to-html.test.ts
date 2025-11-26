import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../markdown-to-html';

describe('markdown-to-html with Prism.js', () => {
  describe('Language Support', () => {
    it('highlights SQL code blocks with correct class names', () => {
      const input = '```sql\nSELECT * FROM users;\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('class="language-sql"');
      expect(result).toContain('<pre><code');
      expect(result).not.toContain('class="hljs"');
    });

    it('highlights JavaScript code blocks using alias', () => {
      const input = '```js\nconsole.log("hello");\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('class="language-javascript"');
      expect(result).toContain('<pre><code');
    });

    it('highlights TypeScript code blocks using alias', () => {
      const input = '```ts\nconst x: number = 1;\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('class="language-typescript"');
      expect(result).toContain('<pre><code');
    });

    it('highlights Bash code blocks using alias', () => {
      const input = '```sh\nls -la\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('class="language-bash"');
      expect(result).toContain('<pre><code');
    });

    it('highlights Markdown code blocks using alias', () => {
      const input = '```md\n# Heading\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('class="language-markdown"');
      expect(result).toContain('<pre><code');
    });

    it('handles case-insensitive language identifiers', () => {
      const input = '```SQL\nSELECT * FROM users;\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('class="language-sql"');
      expect(result).toContain('<pre><code');
    });
  });

  describe('Fallback Behavior', () => {
    it('renders unknown languages as unstyled code blocks', () => {
      const input = '```unknown-language\nsome code\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<pre><code>');
      expect(result).not.toContain('class="language-');
      expect(result).toContain('some code');
    });

    it('renders language-less code blocks as unstyled', () => {
      const input = '```\nsome code\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<pre><code>');
      expect(result).not.toContain('class="language-');
      expect(result).toContain('some code');
    });

    it('escapes HTML in unstyled code blocks', () => {
      const input = '```\n<script>alert("XSS")</script>\n```';
      const result = markdownToHtml.convert(input);

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&quot;XSS&quot;');
    });
  });

  describe('Integration Tests', () => {
    it('handles mixed markdown with code blocks', () => {
      const input = `# Title

Some text with \`inline code\`.

\`\`\`sql
SELECT id, name FROM users WHERE active = true;
\`\`\`

More text.

\`\`\`typescript
interface User {
  id: number;
  name: string;
}
\`\`\`

Final text.`;

      const result = markdownToHtml.convert(input);

      expect(result).toContain('<h1>');
      expect(result).toContain('<code>');
      expect(result).toContain('class="language-sql"');
      expect(result).toContain('class="language-typescript"');
      expect(result).toContain('SELECT'); // Prism.js wraps tokens in spans
      expect(result).toContain('interface'); // Check for keyword presence
    });

    it('handles empty input', () => {
      const result = markdownToHtml.convert('');
      expect(result).toBe('');
    });

    it('handles null/undefined input', () => {
      expect(markdownToHtml.convert(null as any)).toBe('');
      expect(markdownToHtml.convert(undefined as any)).toBe('');
    });
  });

  describe('Security Tests', () => {
    it('prevents XSS in unstyled code blocks', () => {
      const malicious = '<script>alert("XSS")</script>';
      const input = `\`\`\`\n${malicious}\n\`\`\``;
      const result = markdownToHtml.convert(input);

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('escapes various HTML entities', () => {
      const input = '```\n<tag attr="value" & test>\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('&lt;tag');
      expect(result).toContain('attr=&quot;value&quot;');
      expect(result).toContain('&amp; test&gt;');
    });
  });
});