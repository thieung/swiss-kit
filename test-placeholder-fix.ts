import { markdownToJira } from './src/lib/converters/markdown-to-jira';

const input = "2nd paragraph. *Italic*, **bold**, and `monospace`. Itemized lists";
console.log('Input:', input);

const output = markdownToJira.convert(input);
console.log('Output:', output);

const expected = "2nd paragraph. _Italic_, *bold*, and {{monospace}}. Itemized lists";
console.log('Expected:', expected);

console.log('\nContains PLACEHOLDER?', output.includes('PLACEHOLDER'));

if (output.trim() === expected) {
  console.log('✅ PASS');
} else {
  console.log('❌ FAIL');
}
