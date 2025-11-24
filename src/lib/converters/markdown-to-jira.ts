import type { Converter } from './types';

/**
 * Convert markdown to JIRA markup
 * Based on official JIRA documentation:
 * https://jira.atlassian.com/secure/WikiRendererHelpAction.jspa?section=all
 */
export const markdownToJira: Converter = {
  name: 'JIRA',
  convert(markdown: string): string {
    let content = markdown;

    // Step 1: Convert multiline elements (code blocks, blockquotes, tables)
    content = convertMultilineElements(content);

    // Step 2: Process line by line, tracking code block state
    const lines = content.split('\n');
    const jiraLines: string[] = [];
    let inCodeBlock = false;
    let inNoFormat = false;

    for (let line of lines) {
      // Toggle code/noformat block state
      if (line.startsWith('{code') || line.startsWith('{noformat')) {
        inCodeBlock = true;
        jiraLines.push(line);
        continue;
      }
      if (line === '{code}' || line === '{noformat}') {
        inCodeBlock = false;
        jiraLines.push(line);
        continue;
      }

      // Only convert non-code-block lines
      if (!inCodeBlock && !inNoFormat) {
        line = convertLine(line);
      }

      jiraLines.push(line);
    }

    return jiraLines.join('\n');
  }
};

function convertMultilineElements(content: string): string {
  // Convert Setext-style headers (alternate syntax) FIRST
  // Heading level 1: underlined with = characters
  content = content.replace(/^(.+)\n=+\s*$/gm, 'h1. $1');
  // Heading level 2: underlined with - characters
  content = content.replace(/^(.+)\n-+\s*$/gm, 'h2. $1');

  // Convert fenced code blocks (``` or ~~~) FIRST to protect their content
  content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    // Remove trailing newline if present
    code = code.replace(/\n$/, '');
    if (lang) {
      return `{code:${lang}}\n${code}\n{code}`;
    }
    return `{code}\n${code}\n{code}`;
  });

  content = content.replace(/~~~(\w+)?\n([\s\S]*?)~~~/g, (_, lang, code) => {
    code = code.replace(/\n$/, '');
    if (lang) {
      return `{code:${lang}}\n${code}\n{code}`;
    }
    return `{code}\n${code}\n{code}`;
  });

  // Convert indented code blocks (4 spaces or tab)
  // We need to be careful not to match content inside already-converted {code} blocks
  // Process line by line to track state
  const lines = content.split('\n');
  const processedLines: string[] = [];
  let inCodeBlock = false;
  let indentedCodeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track if we're entering/exiting a code block
    if (line.startsWith('{code')) {
      inCodeBlock = true;
      // Flush any buffered indented code
      if (indentedCodeBuffer.length > 0) {
        const code = indentedCodeBuffer.map(l => l.replace(/^(?:    |\t)/, '')).join('\n');
        processedLines.push(`{code}\n${code}\n{code}`);
        indentedCodeBuffer = [];
      }
      processedLines.push(line);
      continue;
    }
    if (line === '{code}' && inCodeBlock) {
      inCodeBlock = false;
      processedLines.push(line);
      continue;
    }

    // If we're inside a code block, don't process for indented code
    if (inCodeBlock) {
      processedLines.push(line);
      continue;
    }

    // Check if this line is indented (4 spaces or tab)
    const isIndented = line.match(/^(?:    |\t)/);

    if (isIndented) {
      // Check if it's a list item
      const trimmed = line.replace(/^(?:    |\t)/, '');
      const isListItem = trimmed.match(/^\s*[-*+]\s/) || trimmed.match(/^\s*\d+\.\s/);

      if (!isListItem) {
        // Add to indented code buffer
        indentedCodeBuffer.push(line);
        continue;
      } else {
        // It's a list item, flush buffer and add the line
        if (indentedCodeBuffer.length > 0) {
          const code = indentedCodeBuffer.map(l => l.replace(/^(?:    |\t)/, '')).join('\n');
          processedLines.push(`{code}\n${code}\n{code}`);
          indentedCodeBuffer = [];
        }
        processedLines.push(line);
      }
    } else {
      // Not indented, flush buffer if any
      if (indentedCodeBuffer.length > 0) {
        const code = indentedCodeBuffer.map(l => l.replace(/^(?:    |\t)/, '')).join('\n');
        processedLines.push(`{code}\n${code}\n{code}`);
        indentedCodeBuffer = [];
      }
      processedLines.push(line);
    }
  }

  // Flush any remaining buffered code
  if (indentedCodeBuffer.length > 0) {
    const code = indentedCodeBuffer.map(l => l.replace(/^(?:    |\t)/, '')).join('\n');
    processedLines.push(`{code}\n${code}\n{code}`);
  }

  content = processedLines.join('\n');

  // Convert blockquotes (> prefix)
  // Multi-line blockquotes
  content = content.replace(/((?:^>.*$\n?)+)/gm, (match) => {
    const quoted = match.replace(/^>\s?/gm, '').trim();
    return `{quote}\n${quoted}\n{quote}\n`;
  });

  // Convert tables
  content = convertTables(content);

  // Convert horizontal rules (---, ___, ***)
  content = content.replace(/^(?:[-_*]){3,}\s*$/gm, '----');

  return content;
}

function convertTables(content: string): string {
  // Match markdown tables
  const tableRegex = /^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm;

  return content.replace(tableRegex, (match, headerRow, bodyRows) => {
    // Convert header row
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter((h: string) => h);
    const jiraHeader = '||' + headers.join('||') + '||';

    // Convert body rows
    const jiraBody = bodyRows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter((c: string) => c);
      return '|' + cells.join('|') + '|';
    }).join('\n');

    return jiraHeader + '\n' + jiraBody;
  });
}

function convertLine(line: string): string {
  let result = line;

  // Convert Setext-style headers (underlined with = or -)
  // This needs to be handled in multiline context, skip for now

  // Convert ATX-style headers (process from h6 to h1 to avoid conflicts)
  result = result.replace(/^#{6}\s+(.+?)(?:\s+#{1,6})?\s*$/, 'h6. $1');
  result = result.replace(/^#{5}\s+(.+?)(?:\s+#{1,5})?\s*$/, 'h5. $1');
  result = result.replace(/^#{4}\s+(.+?)(?:\s+#{1,4})?\s*$/, 'h4. $1');
  result = result.replace(/^#{3}\s+(.+?)(?:\s+#{1,3})?\s*$/, 'h3. $1');
  result = result.replace(/^#{2}\s+(.+?)(?:\s+#{1,2})?\s*$/, 'h2. $1');
  result = result.replace(/^#{1}\s+(.+?)(?:\s+#)?\s*$/, 'h1. $1');

  // Convert lists - handle nested lists by counting leading spaces
  // Ordered lists: 1. 2. 3. etc. -> # ## ### etc.
  const orderedListMatch = result.match(/^(\s*)(\d+)\.\s+(.+)$/);
  if (orderedListMatch) {
    const indent = orderedListMatch[1];
    const text = orderedListMatch[3];
    // Calculate nesting level: 0-2 spaces = level 1, 3-4 = level 2, 5-6 = level 3, etc.
    const level = indent.length <= 2 ? 1 : Math.floor((indent.length - 1) / 2) + 1;
    const jiraPrefix = '#'.repeat(level);
    result = `${jiraPrefix} ${text}`;
  }

  // Unordered lists: *, -, + -> * ** *** etc.
  const unorderedListMatch = result.match(/^(\s*)[-*+]\s+(.+)$/);
  if (unorderedListMatch) {
    const indent = unorderedListMatch[1];
    const text = unorderedListMatch[2];

    // Check if it's a task list
    const taskMatch = text.match(/^\[(x|X| )\]\s+(.+)$/);
    if (taskMatch) {
      const checked = taskMatch[1].toLowerCase() === 'x';
      const taskText = taskMatch[2];
      // JIRA doesn't have native task lists, represent as regular list with markers
      // Calculate nesting level: 0-2 spaces = level 1, 3-4 = level 2, 5-6 = level 3, etc.
      const level = indent.length <= 2 ? 1 : Math.floor((indent.length - 1) / 2) + 1;
      const jiraPrefix = '*'.repeat(level);
      result = `${jiraPrefix} ${checked ? '(/)' : '(x)'} ${taskText}`;
    } else {
      // Regular unordered list
      // Calculate nesting level: 0-2 spaces = level 1, 3-4 = level 2, 5-6 = level 3, etc.
      const level = indent.length <= 2 ? 1 : Math.floor((indent.length - 1) / 2) + 1;
      const jiraPrefix = '*'.repeat(level);
      result = `${jiraPrefix} ${text}`;
    }
  }

  // Convert inline formatting (only if not already converted as list/header)
  if (!result.match(/^[h#*]\d?\.|^[#*]+\s/)) {
    result = convertInlineFormatting(result);
  } else {
    // For headers and lists, still convert inline formatting in the text part
    result = result.replace(/^([h#*]+\d?\.\s+|[#*]+\s+)(.+)$/, (match, prefix, text) => {
      return prefix + convertInlineFormatting(text);
    });
  }

  return result;
}

function convertInlineFormatting(text: string): string {
  let result = text;

  // Use placeholders to avoid conflicts between different formatting types
  const placeholders: { [key: string]: string } = {};
  let placeholderIndex = 0;

  // Helper to create unique placeholder
  const createPlaceholder = (value: string): string => {
    // Use <<< >>> to avoid conflicts with markdown syntax (_ * etc.)
    const placeholder = `<<<PLACEHOLDER_${placeholderIndex++}>>>`;
    placeholders[placeholder] = value;
    return placeholder;
  };

  // Convert inline code FIRST to protect it from other conversions
  result = result.replace(/`([^`]+)`/g, (_, content) =>
    createPlaceholder(`{{${content}}}`)
  );

  // Convert bold+italic combinations first (*** or ___)
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, (_, content) =>
    createPlaceholder(`*_${content}_*`)
  );
  result = result.replace(/___(.+?)___/g, (_, content) =>
    createPlaceholder(`*_${content}_*`)
  );

  // Convert bold (** or __)
  result = result.replace(/\*\*(.+?)\*\*/g, (_, content) =>
    createPlaceholder(`*${content}*`)
  );
  result = result.replace(/__(.+?)__/g, (_, content) =>
    createPlaceholder(`*${content}*`)
  );

  // Convert italic (* or _) - single underscores/asterisks
  result = result.replace(/\*(.+?)\*/g, (_, content) =>
    createPlaceholder(`_${content}_`)
  );
  // For single underscores, match word boundaries to avoid matching placeholder underscores
  result = result.replace(/\b_([^_\s][^_]*?)_\b/g, (_, content) =>
    createPlaceholder(`_${content}_`)
  );

  // Convert strikethrough (~~)
  result = result.replace(/~~(.+?)~~/g, (_, content) =>
    createPlaceholder(`-${content}-`)
  );

  // Convert images ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
    createPlaceholder(`!${url}!`)
  );

  // Convert links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
    createPlaceholder(`[${text}|${url}]`)
  );

  // Restore all placeholders (use split/join for reliability)
  Object.keys(placeholders).forEach(placeholder => {
    result = result.split(placeholder).join(placeholders[placeholder]);
  });

  return result;
}