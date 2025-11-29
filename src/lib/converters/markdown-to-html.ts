import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';

// Markdown to HTML converter using unified pipeline with syntax highlighting
export const markdownToHtml = {
  async convert(input: string): Promise<string> {
    if (!input) return '';

    try {
      const file = await unified()
        .use(remarkParse)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypePrettyCode, {
          theme: {
            dark: 'github-dark',
            light: 'github-light',
          },
          keepBackground: false,
        })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(input);

      return String(file);
    } catch (error) {
      console.error('Error processing markdown:', error);
      return '';
    }
  }
};