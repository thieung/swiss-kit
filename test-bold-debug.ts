import { markdownToJira } from './src/lib/converters/markdown-to-jira';

const input = "**bold text**";
console.log('Input:', JSON.stringify(input));

const output = markdownToJira.convert(input);
console.log('Output:', JSON.stringify(output));
console.log('Expected:', JSON.stringify('*bold text*'));

if (output.trim() === '*bold text*') {
  console.log('✅ PASS');
} else {
  console.log('❌ FAIL');
  console.log('Output contains PLACEHOLDER:', output.includes('PLACEHOLDER'));
}
