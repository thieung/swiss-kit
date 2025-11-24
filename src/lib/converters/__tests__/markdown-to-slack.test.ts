import { describe, it, expect } from 'vitest';
import { markdownToSlack } from '../markdown-to-slack';

describe('Markdown to Slack Converter', () => {
  it('converts headings to bold', () => {
    expect(markdownToSlack.convert('# Heading 1')).toBe('*Heading 1*');
    expect(markdownToSlack.convert('## Heading 2')).toBe('*Heading 2*');
    expect(markdownToSlack.convert('### Heading 3')).toBe('*Heading 3*');
  });

  it('converts bold text', () => {
    expect(markdownToSlack.convert('**bold**')).toBe('*bold*');
    expect(markdownToSlack.convert('__bold__')).toBe('*bold*');
    expect(markdownToSlack.convert('This is **bold** text')).toBe('This is *bold* text');
  });

  it('converts italic text', () => {
    expect(markdownToSlack.convert('*italic*')).toBe('_italic_');
    expect(markdownToSlack.convert('_italic_')).toBe('_italic_');
    expect(markdownToSlack.convert('This is *italic* text')).toBe('This is _italic_ text');
  });

  it('converts links', () => {
    expect(markdownToSlack.convert('[Link](https://example.com)'))
      .toBe('<https://example.com|Link>');
    expect(markdownToSlack.convert('[Google](https://google.com)'))
      .toBe('<https://google.com|Google>');
  });

  it('converts code blocks', () => {
    const md = '```javascript\nconst x = 1;\n```';
    const expected = '```javascript\nconst x = 1;\n```';
    expect(markdownToSlack.convert(md)).toBe(expected);

    const noLangMd = '```\nsome code\n```';
    const noLangExpected = '```\nsome code\n```';
    expect(markdownToSlack.convert(noLangMd)).toBe(noLangExpected);
  });

  it('preserves inline code', () => {
    expect(markdownToSlack.convert('`inline code`')).toBe('`inline code`');
    expect(markdownToSlack.convert('Use `console.log()` for debugging')).toBe('Use `console.log()` for debugging');
  });

  it('converts unordered lists', () => {
    expect(markdownToSlack.convert('- Item 1')).toBe('• Item 1');
    expect(markdownToSlack.convert('* Item 2')).toBe('• Item 2');
    expect(markdownToSlack.convert('- First\n- Second')).toBe('• First\n• Second');
  });

  it('preserves ordered lists', () => {
    expect(markdownToSlack.convert('1. First item')).toBe('1. First item');
    expect(markdownToSlack.convert('2. Second item')).toBe('2. Second item');
  });

  it('converts blockquotes', () => {
    expect(markdownToSlack.convert('> This is a quote')).toBe('> This is a quote');
    expect(markdownToSlack.convert('> Quote line 1\n> Quote line 2')).toBe('> Quote line 1\n> Quote line 2');
  });

  it('handles complex mixed formatting', () => {
    const input = `# Project Overview

This is **important** and _emphasized_.

### Code Example
\`\`\`javascript
function hello() {
  return "world";
}
\`\`\`

Check out [our docs](https://docs.example.com).

**Requirements:**
- Item 1
- Item 2
- Item 3`;

    const expected = `*Project Overview*

This is *important* and _emphasized_.

*Code Example*
\`\`\`javascript
function hello() {
  return "world";
}
\`\`\`

Check out <https://docs.example.com|our docs>.

*Requirements:*
• Item 1
• Item 2
• Item 3`;

    expect(markdownToSlack.convert(input)).toBe(expected);
  });

  it('handles empty input', () => {
    expect(markdownToSlack.convert('')).toBe('');
  });

  it('handles edge case with nested formatting', () => {
    // This is a challenging case - our regex approach has limitations
    // This test documents current behavior
    expect(markdownToSlack.convert('**bold _and italic_**')).toBe('*bold _and italic_*');
  });
});