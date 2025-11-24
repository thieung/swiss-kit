import { describe, it, expect } from 'vitest';
import { markdownToJira } from '../markdown-to-jira';

describe('Markdown to JIRA Converter', () => {
  it('converts headings to JIRA format', () => {
    expect(markdownToJira.convert('# Heading 1')).toBe('h1. Heading 1');
    expect(markdownToJira.convert('## Heading 2')).toBe('h2. Heading 2');
    expect(markdownToJira.convert('### Heading 3')).toBe('h3. Heading 3');
    expect(markdownToJira.convert('###### Heading 6')).toBe('h6. Heading 6');
  });

  it('converts bold text', () => {
    expect(markdownToJira.convert('**bold**')).toBe('*bold*');
    expect(markdownToJira.convert('__bold__')).toBe('*bold*');
    expect(markdownToJira.convert('This is **bold** text')).toBe('This is *bold* text');
  });

  it('converts italic text', () => {
    expect(markdownToJira.convert('*italic*')).toBe('_italic_');
    expect(markdownToJira.convert('_italic_')).toBe('_italic_');
    expect(markdownToJira.convert('This is *italic* text')).toBe('This is _italic_ text');
  });

  it('converts links', () => {
    expect(markdownToJira.convert('[Link](https://example.com)')).toBe('[Link|https://example.com]');
    expect(markdownToJira.convert('[Google](https://google.com)')).toBe('[Google|https://google.com]');
  });

  it('converts code blocks', () => {
    const md = '```javascript\nconst x = 1;\n```';
    const expected = '{code:javascript}\nconst x = 1;\n{code}';
    expect(markdownToJira.convert(md)).toBe(expected);

    const noLangMd = '```\nsome code\n```';
    const noLangExpected = '{code:none}\nsome code\n{code}';
    expect(markdownToJira.convert(noLangMd)).toBe(noLangExpected);
  });

  it('converts inline code', () => {
    expect(markdownToJira.convert('`inline code`')).toBe('{{inline code}}');
    expect(markdownToJira.convert('Use {{console.log()}} for debugging')).toBe('Use {{console.log()}} for debugging');
  });

  it('converts unordered lists', () => {
    expect(markdownToJira.convert('- Item 1')).toBe('* Item 1');
    expect(markdownToJira.convert('* Item 2')).toBe('* Item 2');
    expect(markdownToJira.convert('- First\n- Second')).toBe('* First\n* Second');
  });

  it('converts ordered lists', () => {
    expect(markdownToJira.convert('1. First item')).toBe('# First item');
    expect(markdownToJira.convert('2. Second item')).toBe('# Second item');
    expect(markdownToJira.convert('1. First\n2. Second')).toBe('# First\n# Second');
  });

  it('converts blockquotes', () => {
    expect(markdownToJira.convert('> This is a quote')).toBe('{quote}\nThis is a quote\n{quote}');
    expect(markdownToJira.convert('> Quote line 1\n> Quote line 2')).toBe('{quote}\nQuote line 1\n{quote}\n{quote}\nQuote line 2\n{quote}');
  });

  it('converts tables (basic)', () => {
    // Header row detection (based on uppercase or "Header")
    expect(markdownToJira.convert('| Header 1 | Header 2 |')).toBe('||Header 1||Header 2||');
    expect(markdownToJira.convert('| Name | Status |')).toBe('||Name||Status||');

    // Regular data rows
    expect(markdownToJira.convert('| Cell 1 | Cell 2 |')).toBe('|Cell 1|Cell 2|');
    expect(markdownToJira.convert('| John | Active |')).toBe('|John|Active|');
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

    const expected = `h1. Project Overview

This is *important* and _emphasized_.

h3. Code Example
{code:javascript}
function hello() {
  return "world";
}
{code}

Check out [our docs|https://docs.example.com].

*Requirements:*
* Item 1
* Item 2
* Item 3`;

    expect(markdownToJira.convert(input)).toBe(expected);
  });

  it('handles empty input', () => {
    expect(markdownToJira.convert('')).toBe('');
  });

  it('handles tables with mixed content', () => {
    const input = `| Name | Age | Status |
| John | 25 | Active |
| Jane | 30 | Inactive |`;

    const expected = `||Name||Age||Status||
|John|25|Active|
|Jane|30|Inactive|`;

    expect(markdownToJira.convert(input)).toBe(expected);
  });

  it('handles edge case with nested formatting', () => {
    // This is a challenging case - our regex approach has limitations
    // This test documents current behavior
    expect(markdownToJira.convert('**bold _and italic_**')).toBe('*bold _and italic_*');
  });
});