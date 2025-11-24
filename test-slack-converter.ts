import { markdownToSlack } from './src/lib/converters/markdown-to-slack';

const testCases = [
  {
    name: 'Bold',
    input: '**bold text** and __also bold__',
    expected: '*bold text* and *also bold*'
  },
  {
    name: 'Italic',
    input: '*italic text*',
    expected: '_italic text_'
  },
  {
    name: 'Bold and Italic',
    input: '***bold and italic***',
    expected: '*_bold and italic_*'
  },
  {
    name: 'Strikethrough',
    input: '~~strikethrough text~~',
    expected: '~strikethrough text~'
  },
  {
    name: 'Inline code',
    input: 'This is `inline code` here',
    expected: 'This is `inline code` here'
  },
  {
    name: 'Code block with language',
    input: '```javascript\nconst x = 1;\nconsole.log(x);\n```',
    expected: '```javascript\nconst x = 1;\nconsole.log(x);\n```'
  },
  {
    name: 'Code block without language',
    input: '```\nplain code\n```',
    expected: '```\nplain code\n```'
  },
  {
    name: 'Links',
    input: '[Google](https://google.com)',
    expected: '<https://google.com|Google>'
  },
  {
    name: 'Images',
    input: '![Alt text](https://example.com/image.png)',
    expected: '<https://example.com/image.png>'
  },
  {
    name: 'Headings',
    input: '# Heading 1\n## Heading 2\n### Heading 3',
    expected: '*Heading 1*\n*Heading 2*\n*Heading 3*'
  },
  {
    name: 'Unordered list',
    input: '- Item 1\n- Item 2\n- Item 3',
    expected: '• Item 1\n• Item 2\n• Item 3'
  },
  {
    name: 'Ordered list',
    input: '1. First\n2. Second\n3. Third',
    expected: '1. First\n2. Second\n3. Third'
  },
  {
    name: 'Blockquote',
    input: '> This is a quote\n> Multi-line quote',
    expected: '> This is a quote\n> Multi-line quote'
  },
  {
    name: 'Task list',
    input: '- [ ] Unchecked\n- [x] Checked',
    expected: '• ☐ Unchecked\n• ☑ Checked'
  },
  {
    name: 'Nested list',
    input: '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2',
    expected: '• Item 1\n  • Nested 1\n  • Nested 2\n• Item 2'
  },
  {
    name: 'Horizontal rule',
    input: '---',
    expected: '──────────'
  },
  {
    name: 'Mixed formatting',
    input: 'This is **bold** and *italic* and ~~strikethrough~~ with `code`',
    expected: 'This is *bold* and _italic_ and ~strikethrough~ with `code`'
  }
];

console.log('Testing Slack Converter (Reference Implementation)\n' + '='.repeat(50));

let passed = 0;
let failed = 0;

testCases.forEach(({ name, input, expected }) => {
  const result = markdownToSlack.convert(input);
  const success = result === expected;

  if (success) {
    passed++;
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name}`);
    console.log(`  Input:    ${JSON.stringify(input)}`);
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Got:      ${JSON.stringify(result)}`);
    console.log('');
  }
});

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
