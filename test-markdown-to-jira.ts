import { markdownToJira } from './src/lib/converters/markdown-to-jira';

console.log('=== MARKDOWN TO JIRA CONVERTER TEST ===\n');

const testCases = [
  {
    name: 'Headers',
    input: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`,
    expected: `h1. Heading 1
h2. Heading 2
h3. Heading 3
h4. Heading 4
h5. Heading 5
h6. Heading 6`
  },
  {
    name: 'Text Formatting',
    input: `**bold text**
*italic text*
***bold and italic***
~~strikethrough~~
\`inline code\``,
    expected: `*bold text*
_italic text_
*_bold and italic_*
-strikethrough-
{{inline code}}`
  },
  {
    name: 'Links',
    input: `[Google](https://google.com)
[Link with title](https://example.com)`,
    expected: `[Google|https://google.com]
[Link with title|https://example.com]`
  },
  {
    name: 'Images',
    input: `![Alt text](https://example.com/image.png)
![](https://example.com/logo.jpg)`,
    expected: `!https://example.com/image.png!
!https://example.com/logo.jpg!`
  },
  {
    name: 'Unordered Lists',
    input: `* Item 1
* Item 2
  * Nested item 2.1
  * Nested item 2.2
    * Deep nested 2.2.1
* Item 3`,
    expected: `* Item 1
* Item 2
* Nested item 2.1
* Nested item 2.2
** Deep nested 2.2.1
* Item 3`
  },
  {
    name: 'Ordered Lists',
    input: `1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item`,
    expected: `# First item
# Second item
## Nested item 2.1
## Nested item 2.2
# Third item`
  },
  {
    name: 'Task Lists',
    input: `- [x] Completed task
- [ ] Incomplete task
  - [x] Nested completed
  - [ ] Nested incomplete`,
    expected: `* (/) Completed task
* (x) Incomplete task
* (/) Nested completed
* (x) Nested incomplete`
  },
  {
    name: 'Code Blocks - Fenced',
    input: `\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\``,
    expected: `{code:javascript}
function hello() {
  console.log("Hello World");
}
{code}`
  },
  {
    name: 'Code Blocks - No Language',
    input: `\`\`\`
plain text code
no syntax highlighting
\`\`\``,
    expected: `{code}
plain text code
no syntax highlighting
{code}`
  },
  {
    name: 'Blockquotes',
    input: `> This is a quote
> spanning multiple lines
> with more content`,
    expected: `{quote}
This is a quote
spanning multiple lines
with more content
{quote}`
  },
  {
    name: 'Tables',
    input: `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`,
    expected: `||Header 1||Header 2||Header 3||
|Cell 1|Cell 2|Cell 3|
|Cell 4|Cell 5|Cell 6|`
  },
  {
    name: 'Horizontal Rules',
    input: `---
___
***`,
    expected: `----
----
----`
  },
  {
    name: 'Mixed Formatting',
    input: `# Project **Status** Report

## Overview
This is a *sample* document with **mixed** formatting.

### Features
* **Bold** item
* *Italic* item
* \`Code\` item
  * Nested with [link](https://example.com)

### Code Example
\`\`\`python
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

> **Note**: This is important!`,
    expected: `h1. Project *Status* Report

h2. Overview
This is a _sample_ document with *mixed* formatting.

h3. Features
* *Bold* item
* _Italic_ item
* {{Code}} item
* Nested with [link|https://example.com]

h3. Code Example
{code:python}
def greet(name):
    print(f"Hello, {name}!")
{code}

{quote}
*Note*: This is important!
{quote}`
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((tc, index) => {
  const output = markdownToJira.convert(tc.input);
  const normOutput = output.replace(/\r\n/g, '\n').trim();
  const normExpected = tc.expected.replace(/\r\n/g, '\n').trim();

  const isPass = normOutput === normExpected;

  console.log(`\n${index + 1}. Test: ${tc.name}`);
  console.log(`Status: ${isPass ? '✅ PASS' : '❌ FAIL'}`);

  if (!isPass) {
    console.log('\nInput:');
    console.log(tc.input);
    console.log('\nExpected:');
    console.log(normExpected);
    console.log('\nActual:');
    console.log(normOutput);
    failed++;
  } else {
    passed++;
  }
  console.log('─'.repeat(60));
});

console.log(`\n\n=== SUMMARY ===`);
console.log(`Total: ${testCases.length}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
