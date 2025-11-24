import { markdownToSlack } from './src/lib/converters/markdown-to-slack';

console.log('='.repeat(60));
console.log('COMPREHENSIVE SLACK CONVERTER TEST');
console.log('='.repeat(60));

const complexMarkdown = `# Main Heading

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***.

## Subheading with Code

Here's some \`inline code\` and a [link to Google](https://google.com).

### Code Block Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists and Tasks

- Unordered item 1
- Unordered item 2
  - Nested item 2.1
  - Nested item 2.2
- Unordered item 3

1. Ordered item 1
2. Ordered item 2
3. Ordered item 3

**Task List:**
- [ ] Todo item 1
- [x] Completed item 2
- [ ] Todo item 3

### Formatting Combinations

This text has ~~strikethrough~~, **bold**, *italic*, and \`code\`.

> This is a blockquote
> It can span multiple lines

### Edge Cases

**Bold with *italic inside* it**
*Italic with **bold inside** it*

---

End of document.
`;

console.log('\n📝 INPUT MARKDOWN:\n');
console.log(complexMarkdown);
console.log('\n' + '='.repeat(60));
console.log('📤 SLACK OUTPUT:\n');

const slackOutput = markdownToSlack.convert(complexMarkdown);
console.log(slackOutput);

console.log('\n' + '='.repeat(60));
console.log('✅ Conversion completed successfully!');
console.log('='.repeat(60));
