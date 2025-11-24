
import { markdownToJira } from './src/lib/converters/markdown-to-jira';

const testCases = [
  {
    name: "Basic List",
    input: `* Item 1
* Item 2`,
    expected: `* Item 1
* Item 2`
  },
  {
    name: "Indented List (2 spaces)",
    input: `  * Item 1
  * Item 2`,
    expected: `* Item 1
* Item 2`
  },
  {
    name: "Nested List (4 spaces)",
    input: `* Level 1
    * Level 2`,
    expected: `* Level 1
** Level 2`
  },
  {
    name: "Deep Nested List (6 spaces)",
    input: `* Level 1
    * Level 2
      * Level 3`,
    expected: `* Level 1
** Level 2
*** Level 3`
  }
];

testCases.forEach(tc => {
  const output = markdownToJira.convert(tc.input);
  console.log(`Test: ${tc.name}`);
  console.log(`Input:\n${JSON.stringify(tc.input)}`);
  console.log(`Output:\n${JSON.stringify(output)}`);

  // Normalize newlines for comparison
  const normOutput = output.replace(/\r\n/g, '\n').trim();
  const normExpected = tc.expected.replace(/\r\n/g, '\n').trim();

  if (normOutput === normExpected) {
    console.log("PASS");
  } else {
    console.log("FAIL");
    console.log(`Expected:\n${JSON.stringify(normExpected)}`);
    console.log(`Actual:\n${JSON.stringify(normOutput)}`);
  }
  console.log('---');
});
