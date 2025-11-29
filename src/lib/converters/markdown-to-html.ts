import { marked } from 'marked';

// Simple markdown to HTML converter using marked
export const markdownToHtml = {
  convert(input: string): string {
    if (!input) return '';

    try {
      return marked.parse(input) as string;
    } catch (error) {
      console.error('Error processing markdown:', error);
      return '';
    }
  }
};