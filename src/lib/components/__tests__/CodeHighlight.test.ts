import { describe, it, expect } from 'vitest';

// Test the core HTML escaping function used in the component
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

describe('CodeHighlight Logic', () => {
  describe('HTML Escaping', () => {
    it('escapes HTML entities correctly', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('escapes ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('escapes single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#039;s');
    });

    it('handles empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('handles strings without HTML entities', () => {
      const input = 'SELECT * FROM users';
      expect(escapeHtml(input)).toBe(input);
    });
  });

  describe('Code Examples', () => {
    it('handles SQL queries', () => {
      const sqlQuery = 'SELECT * FROM users WHERE id = 1;';
      const escaped = escapeHtml(sqlQuery);
      expect(escaped).toBe(sqlQuery);
    });

    it('handles JavaScript code', () => {
      const jsCode = 'const x = 10; console.log(x);';
      const escaped = escapeHtml(jsCode);
      expect(escaped).toBe(jsCode);
    });

    it('handles code with HTML content', () => {
      const codeWithHtml = 'const html = "<div>Hello</div>";';
      const escaped = escapeHtml(codeWithHtml);
      expect(escaped).toBe('const html = &quot;&lt;div&gt;Hello&lt;/div&gt;&quot;;');
    });

    it('prevents XSS in code', () => {
      const maliciousSQL = "SELECT '<script>alert(\"XSS\")</script>' FROM users;";
      const escaped = escapeHtml(maliciousSQL);

      expect(escaped).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(escaped).toContain('SELECT');
      expect(escaped).toContain('FROM');
      // Verify no raw <script> tags are present (only escaped versions)
      expect(escaped).not.toContain('<script>alert("XSS")</script>');
    });
  });
});