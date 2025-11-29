import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../markdown-to-html';

describe('markdown-to-html with marked', () => {
  describe('Basic Functionality', () => {
    it('converts simple markdown to HTML', async () => {
      const input = '# Hello World';
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('<h1');
      expect(result).toContain('Hello World');
    });

    it('handles code blocks', async () => {
      const input = '```sql\nSELECT * FROM users;\n```';
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM');
      expect(result).toContain('users');
    });

    it('handles inline code', async () => {
      const input = 'Here is some `inline code`.';
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('<code');
      expect(result).toContain('inline code');
    });

    it('handles empty input', async () => {
      const result = await markdownToHtml.convert('');
      expect(result).toBe('');
    });

    it('handles null/undefined input', async () => {
      const result1 = await markdownToHtml.convert(null as any);
      const result2 = await markdownToHtml.convert(undefined as any);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
  });

  describe('Code Blocks', () => {
    it('processes SQL code blocks', async () => {
      const input = '```sql\nSELECT id, name FROM users WHERE active = true;\n```';
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('data-language="sql"');
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM');
      expect(result).toContain('WHERE');
    });

    it('processes JavaScript code blocks', async () => {
      const input = '```js\nconst greeting = "Hello";\nconsole.log(greeting);\n```';
      const result = await markdownToHtml.convert(input);

      // Shiki might normalize 'js' to 'javascript'
      expect(result).toMatch(/data-language="(js|javascript)"/);
      expect(result).toContain('const');
      expect(result).toContain('console');
      expect(result).toContain('log');
    });

    it('processes TypeScript code blocks', async () => {
      const input = '```ts\ninterface User {\n  id: number;\n  name: string;\n}\n```';
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('data-language="ts"');
      expect(result).toContain('interface');
      expect(result).toContain('User');
    });
  });

  describe('Security', () => {
    it('escapes HTML in code blocks', async () => {
      const input = '```html\n<script>alert("XSS")</script>\n```';
      const result = await markdownToHtml.convert(input);


      expect(result).not.toContain('<script>alert("XSS")</script>');

      // rehype-pretty-code uses hex entities
      expect(result).toMatch(/(&#x3C;|&lt;)/);
      expect(result).toContain('script');
      expect(result).toMatch(/(&#x3C;|&lt;)\//); // </script>
    });

    it('handles malicious input safely', async () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('<img');
      expect(result).toContain('src="x"');
    });
  });

  describe('Complex Documents', () => {
    it('handles mixed content with code blocks', async () => {
      const input = `# Document Title

This is a paragraph with \`inline code\`.

## Code Example

\`\`\`sql
SELECT COUNT(*) FROM users;
\`\`\`

Another paragraph.`;
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('<h1>');
      expect(result).toContain('<h2>');
      expect(result).toContain('Document Title');
      expect(result).toContain('Code Example');
      expect(result).toContain('data-language="sql"');
      expect(result).toContain('SELECT');
      expect(result).toContain('COUNT');
      expect(result).toContain('FROM');
      expect(result).toContain('users');
    });
  });

  describe('Fallback Behavior', () => {
    it('handles unknown languages gracefully', async () => {
      const input = '```unknown-language\nsome random code\n```';
      const result = await markdownToHtml.convert(input);

      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('some random code');
    });
  });
});