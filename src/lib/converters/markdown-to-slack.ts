import type { Converter } from './types';

/**
 * Convert markdown to Slack markup
 * Based on https://github.com/fla9ua/markdown_to_mrkdwn
 */
export const markdownToSlack: Converter = {
  name: 'Slack',
  convert(markdown: string): string {
    if (!markdown) return '';

    try {
      let result = markdown.trim();
      let inCodeBlock = false;

      // Placeholders for triple emphasis
      const TRIPLE_START = '%%BOLDITALIC_START%%';
      const TRIPLE_END = '%%BOLDITALIC_END%%';

      // Define patterns in the same order as reference implementation
      const patterns: Array<[RegExp, string]> = [
        // Task lists (must come before regular lists)
        [/^(\s*)- \[([ ])\] (.+)/gm, '$1• ☐ $3'],  // Unchecked task
        [/^(\s*)- \[([xX])\] (.+)/gm, '$1• ☑ $3'],  // Checked task
        // Regular lists
        [/^(\s*)- (.+)/gm, '$1• $2'],  // Unordered list
        [/^(\s*)(\d+)\. (.+)/gm, '$1$2. $3'],  // Ordered list
        // Images
        [/!\[.*?\]\((.+?)\)/gm, '<$1>'],  // Images to URL
        // Italic (must come before bold)
        [/(?<!\*)\*([^*\n]+?)\*(?!\*)/gm, '_$1_'],  // Italic
        // Headings (H6 to H1)
        [/^###### (.+)$/gm, '*$1*'],  // H6
        [/^##### (.+)$/gm, '*$1*'],   // H5
        [/^#### (.+)$/gm, '*$1*'],    // H4
        [/^### (.+)$/gm, '*$1*'],     // H3
        [/^## (.+)$/gm, '*$1*'],      // H2
        [/^# (.+)$/gm, '*$1*'],       // H1
        // Bold with space handling (special case from reference)
        [/(^|\s)~\*\*(.+?)\*\*(\s|$)/gm, '$1 *$2* $3'],
        // Bold
        [/(?<!\*)\*\*(.+?)\*\*(?!\*)/gm, '*$1*'],  // Bold
        [/__(.+?)__/gm, '*$1*'],  // Underline as bold
        // Links
        [/\[(.+?)\]\((.+?)\)/gm, '<$2|$1>'],  // Links
        // Inline code (keep as-is)
        [/`(.+?)`/gm, '`$1`'],  // Inline code
        // Blockquotes
        [/^> (.+)/gm, '> $1'],  // Blockquote
        // Horizontal rules
        [/^(---|\*\*\*|___)$/gm, '──────────'],  // Horizontal line
        // Strikethrough
        [/~~(.+?)~~/gm, '~$1~'],  // Strikethrough
      ];

      // Process line by line to handle code blocks
      const lines = result.split('\n');
      const convertedLines: string[] = [];

      for (let line of lines) {
        // Check for code block markers
        const codeBlockMatch = line.match(/^```(\w*)$/);
        if (codeBlockMatch) {
          inCodeBlock = !inCodeBlock;
          const language = codeBlockMatch[1];
          convertedLines.push(language ? `\`\`\`${language}` : '```');
          continue;
        }

        // Don't process lines inside code blocks
        if (inCodeBlock) {
          convertedLines.push(line);
          continue;
        }

        // Handle triple emphasis with placeholders (***text***)
        line = line.replace(
          /(?<!\*)\*\*\*([^*\n]+?)\*\*\*(?!\*)/g,
          (match, content) => `${TRIPLE_START}${content}${TRIPLE_END}`
        );

        // Apply all patterns in order
        for (const [pattern, replacement] of patterns) {
          line = line.replace(pattern, replacement);
        }

        // Replace triple emphasis placeholders with final format
        line = line.replace(
          new RegExp(`${TRIPLE_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(.*?)${TRIPLE_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
          '*_$1_*'
        );

        convertedLines.push(line.trimEnd());
      }

      return convertedLines.join('\n');
    } catch (error) {
      // Return original markdown on error
      console.error('Markdown conversion error:', error);
      return markdown;
    }
  }
};