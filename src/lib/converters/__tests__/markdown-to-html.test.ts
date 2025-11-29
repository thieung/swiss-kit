import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../markdown-to-html';

describe('markdown-to-html with marked', () => {
  describe('Basic Functionality', () => {
    it('converts simple markdown to HTML', () => {
      const input = '# Hello World';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<h1');
      expect(result).toContain('Hello World');
    });

    it('handles code blocks', () => {
      const input = '```sql\nSELECT * FROM users;\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('SELECT * FROM users');
    });

    it('handles inline code', () => {
      const input = 'Here is some `inline code`.';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<code>');
      expect(result).toContain('inline code');
    });

    it('handles empty input', () => {
      const result = markdownToHtml.convert('');
      expect(result).toBe('');
    });

    it('handles null/undefined input', () => {
      const result1 = markdownToHtml.convert(null as any);
      const result2 = markdownToHtml.convert(undefined as any);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
  });

  describe('Code Blocks', () => {
    it('processes SQL code blocks', () => {
      const input = '```sql\nSELECT id, name FROM users WHERE active = true;\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('language-sql');
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM');
      expect(result).toContain('WHERE');
    });

    it('processes JavaScript code blocks', () => {
      const input = '```js\nconst greeting = "Hello";\nconsole.log(greeting);\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('language-javascript');
      expect(result).toContain('const');
      expect(result).toContain('console.log');
    });

    it('processes TypeScript code blocks', () => {
      const input = '```ts\ninterface User {\n  id: number;\n  name: string;\n}\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('language-typescript');
      expect(result).toContain('interface');
      expect(result).toContain('User');
    });
  });

  describe('Security', () => {
    it('escapes HTML in code blocks', () => {
      const input = '```html\n<script>alert("XSS")</script>\n```';
      const result = markdownToHtml.convert(input);

      expect(result).not.toContain('<script>alert("XSS")</script>');
      // marked should escape HTML in code blocks
      expect(result).toContain('&lt;script&gt;');
    });

    it('handles malicious input safely', () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<img');
      expect(result).toContain('src="x"');
    });
  });

  describe('Complex Documents', () => {
    it('handles mixed content with code blocks', () => {
      const input = `# Document Title

This is a paragraph with \`inline code\`.

## Code Example

\`\`\`sql
SELECT COUNT(*) FROM users;
\`\`\`

Another paragraph.`;
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<h1>');
      expect(result).toContain('<h2>');
      expect(result).toContain('Document Title');
      expect(result).toContain('Code Example');
      expect(result).toContain('language-sql');
      expect(result).toContain('SELECT COUNT(*) FROM users');
    });
  });

  describe('Fallback Behavior', () => {
    it('handles unknown languages gracefully', () => {
      const input = '```unknown-language\nsome random code\n```';
      const result = markdownToHtml.convert(input);

      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
      expect(result).toContain('some random code');
    });
  });
});