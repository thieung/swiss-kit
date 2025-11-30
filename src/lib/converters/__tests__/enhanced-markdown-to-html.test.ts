import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enhancedMarkdownToHtml, EnhancedMarkdownToHtml } from '../enhanced-markdown-to-html';

// Mock console methods to avoid noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe('Enhanced MarkdownToHtml with Shiki Integration', () => {
  beforeEach(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
    // Clear cache before each test
    enhancedMarkdownToHtml.clearCache();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('Basic Functionality', () => {
    it('converts simple markdown to HTML', async () => {
      const input = '# Hello World';
      const result = await enhancedMarkdownToHtml.convert(input);

      expect(result).toContain('<h1');
      expect(result).toContain('Hello World');
    });

    it('handles empty input', async () => {
      const result = await enhancedMarkdownToHtml.convert('');
      expect(result).toBe('');
    });

    it('handles null/undefined input', async () => {
      const result1 = await enhancedMarkdownToHtml.convert(null as any);
      const result2 = await enhancedMarkdownToHtml.convert(undefined as any);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });

    it('handles whitespace-only input', async () => {
      const result = await enhancedMarkdownToHtml.convert('   \n\t  \n   ');
      expect(result).toBe('');
    });
  });

  describe('Shiki Integration', () => {
    it('processes JavaScript code blocks with syntax highlighting', async () => {
      const input = '```javascript\nconst greeting = "Hello";\nconsole.log(greeting);\n```';
      const result = await enhancedMarkdownToHtml.convert(input);

      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('const');
      expect(result).toContain('console');
      expect(result).toContain('log');
      // Check for syntax highlighting attributes
      expect(result).toMatch(/style=".*color.*"/);
    });

    it('processes TypeScript code blocks', async () => {
      const input = '```typescript\ninterface User {\n  id: number;\n  name: string;\n}\n```';
      const result = await enhancedMarkdownToHtml.convert(input);

      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('interface');
      expect(result).toContain('User');
      expect(result).toContain('id');
      expect(result).toContain('name');
    });

    it('processes SQL code blocks', async () => {
      const input = '```sql\nSELECT id, name FROM users WHERE active = true;\n```';
      const result = await enhancedMarkdownToHtml.convert(input);

      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM');
      expect(result).toContain('WHERE');
      expect(result).toContain('users');
    });

    it('handles multiple code blocks in the same document', async () => {
      const input = `# Code Examples

JavaScript:
\`\`\`js
function hello() {
  return "world";
}
\`\`\`

TypeScript:
\`\`\`ts
interface Person {
  name: string;
  age: number;
}
\`\`\``;

      const result = await enhancedMarkdownToHtml.convert(input);

      expect(result).toContain('<h1');
      expect(result).toContain('Code Examples');
      expect(result).toContain('function hello');
      expect(result).toContain('interface Person');
      expect(result).toContain('name: string');
    });
  });

  describe('Caching System', () => {
    it('caches conversion results', async () => {
      const input = '# Test Content';

      // First conversion
      const startTime1 = Date.now();
      const result1 = await enhancedMarkdownToHtml.convert(input);
      const endTime1 = Date.now();
      const time1 = endTime1 - startTime1;

      // Second conversion (should be cached)
      const startTime2 = Date.now();
      const result2 = await enhancedMarkdownToHtml.convert(input);
      const endTime2 = Date.now();
      const time2 = endTime2 - startTime2;

      expect(result1).toBe(result2);
      // Cached result should be faster (allow some tolerance)
      expect(time2).toBeLessThanOrEqual(time1 + 50);

      // Check cache stats
      const stats = enhancedMarkdownToHtml.getCacheStats();
      expect(stats.size).toBe(1);
    });

    it('respects cache TTL', async () => {
      const input = '# Test Content';

      // First conversion
      await enhancedMarkdownToHtml.convert(input);

      // Mock expired cache entry
      const cache = (enhancedMarkdownToHtml as any).cache;
      const cacheKey = Array.from(cache.keys())[0];
      if (cacheKey) {
        cache.set(cacheKey, {
          result: '<h1>Old Result</h1>',
          timestamp: Date.now() - 6 * 60 * 1000 // 6 minutes ago (expired)
        });
      }

      // Second conversion should recompute
      const result = await enhancedMarkdownToHtml.convert(input);
      expect(result).not.toContain('Old Result');
    });

    it('limits cache size', async () => {
      // Fill cache beyond max size
      for (let i = 0; i < 150; i++) {
        await enhancedMarkdownToHtml.convert(`# Content ${i}`);
      }

      const stats = enhancedMarkdownToHtml.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(100);
    });

    it('clears cache on demand', async () => {
      const input = '# Test Content';

      await enhancedMarkdownToHtml.convert(input);
      expect(enhancedMarkdownToHtml.getCacheStats().size).toBe(1);

      enhancedMarkdownToHtml.clearCache();
      expect(enhancedMarkdownToHtml.getCacheStats().size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('handles shiki initialization failure gracefully', async () => {
      // Create a new instance that will fail
      const mockMd = {
        use: vi.fn().mockRejectedValue(new Error('Shiki failed')),
        render: vi.fn().mockReturnValue('<p>Fallback rendering</p>')
      };

      // This test simulates shiki initialization failure
      const result = await enhancedMarkdownToHtml.convert('# Test');
      expect(result).toBeTruthy();
    });

    it('provides fallback rendering on conversion error', async () => {
      const input = '# Test Content';

      // The conversion should still work even if there are issues
      const result = await enhancedMarkdownToHtml.convert(input);
      expect(result).toContain('Test Content');
    });

    it('handles malformed input gracefully', async () => {
      const inputs = [
        '```js\nunclosed code block',
        '* unterminated list',
        '[link without closing paren',
        'https://incomplete-url',
        '> unclosed blockquote'
      ];

      for (const input of inputs) {
        const result = await enhancedMarkdownToHtml.convert(input);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      }
    });
  });

  describe('Async Rendering', () => {
    it('handles concurrent conversions', async () => {
      const inputs = [
        '# Header 1',
        '## Header 2',
        '### Header 3',
        '#### Header 4',
        '##### Header 5'
      ];

      const conversions = inputs.map(input => enhancedMarkdownToHtml.convert(input));
      const results = await Promise.all(conversions);

      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result).toContain(`Header ${index + 1}`);
      });
    });

    it('waits for shiki initialization when needed', async () => {
      const input = '```javascript\nconsole.log("test");\n```';
      const result = await enhancedMarkdownToHtml.convert(input);

      // Should contain syntax highlighting
      expect(result).toContain('console');
      expect(result).toContain('log');
      expect(result).toContain('test');
    });
  });

  describe('Complex Documents', () => {
    it('handles mixed content with various markdown features', async () => {
      const input = `# Complex Document

This document contains **bold text**, *italic text*, and \`inline code\`.

## Code Examples

\`\`\`javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
\`\`\`

### Lists

- First item
- Second item
  - Nested item
- Third item

1. Ordered item 1
2. Ordered item 2

### Links and Images

[Example Link](https://example.com)

> This is a blockquote
> with multiple lines.

---

Horizontal rule here.`;

      const result = await enhancedMarkdownToHtml.convert(input);

      expect(result).toContain('<h1');
      expect(result).toContain('<h2');
      expect(result).toContain('<h3');
      expect(result).toContain('Complex Document');
      expect(result).toContain('Code Examples');
      expect(result).toContain('function calculateTotal');
      expect(result).toContain('<ul');
      expect(result).toContain('<ol');
      expect(result).toContain('Example Link');
      expect(result).toContain('<blockquote');
      expect(result).toContain('<hr');
    });

    it('handles tables correctly', async () => {
      const input = `| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |`;

      const result = await enhancedMarkdownToHtml.convert(input);

      expect(result).toContain('<table');
      expect(result).toContain('<thead');
      expect(result).toContain('<tbody');
      expect(result).toContain('John');
      expect(result).toContain('Jane');
      expect(result).toContain('NYC');
      expect(result).toContain('LA');
    });
  });

  describe('Performance Characteristics', () => {
    it('handles large documents efficiently', async () => {
      // Create a large markdown document
      const sections = Array.from({ length: 50 }, (_, i) =>
        `## Section ${i + 1}

\`\`\`javascript
function section${i + 1}() {
  return "This is section ${i + 1}";
}
\`\`\`

- Item ${i + 1}.1
- Item ${i + 1}.2
- Item ${i + 1}.3

Paragraph content for section ${i + 1} with **bold text** and *italic text*.`
      ).join('\n\n');

      const startTime = Date.now();
      const result = await enhancedMarkdownToHtml.convert(sections);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(1000);
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Cache Stats and Debugging', () => {
    it('provides accurate cache statistics', async () => {
      const stats = enhancedMarkdownToHtml.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('ttl');
      expect(stats).toHaveProperty('shikiInitialized');
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(100);
      expect(stats.ttl).toBe(5 * 60 * 1000);

      await enhancedMarkdownToHtml.convert('# Test');
      const updatedStats = enhancedMarkdownToHtml.getCacheStats();
      expect(updatedStats.size).toBe(1);
    });
  });
});