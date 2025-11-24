import { markdownToJira } from './src/lib/converters/markdown-to-jira';

const testInput = `~~~python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~`;

const expected = `{code:python}
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
{code}`;

console.log('Input:');
console.log(testInput);
console.log('\n' + '='.repeat(60) + '\n');

const output = markdownToJira.convert(testInput);
console.log('Output:');
console.log(output);
console.log('\n' + '='.repeat(60) + '\n');

console.log('Expected:');
console.log(expected);
console.log('\n' + '='.repeat(60) + '\n');

const normOutput = output.replace(/\r\n/g, '\n').trim();
const normExpected = expected.replace(/\r\n/g, '\n').trim();

if (normOutput === normExpected) {
  console.log('✅ TEST PASSED');
} else {
  console.log('❌ TEST FAILED');
  console.log('\nDifference:');
  console.log('Output length:', normOutput.length);
  console.log('Expected length:', normExpected.length);

  // Show character-by-character comparison
  const maxLen = Math.max(normOutput.length, normExpected.length);
  for (let i = 0; i < maxLen; i++) {
    if (normOutput[i] !== normExpected[i]) {
      console.log(`First difference at position ${i}:`);
      console.log(`  Output: "${normOutput.substring(i, i + 20)}" (char code: ${normOutput.charCodeAt(i)})`);
      console.log(`  Expected: "${normExpected.substring(i, i + 20)}" (char code: ${normExpected.charCodeAt(i)})`);
      break;
    }
  }
}
