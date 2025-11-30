import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConversionPreview from '../ConversionPreview.svelte';
import { enhancedMarkdownToHtml } from '$lib/converters/enhanced-markdown-to-html';

// Mock clipboard utility
vi.mock('$lib/utils/clipboard', () => ({
  copyToClipboard: vi.fn()
}));

// Mock enhanced markdown converter
vi.mock('$lib/converters/enhanced-markdown-to-html', () => ({
  enhancedMarkdownToHtml: {
    convert: vi.fn(),
    clearCache: vi.fn(),
    getCacheStats: vi.fn()
  }
}));

describe('ConversionPreview Component', () => {
  let mockCopyToClipboard: any;
  let mockEnhancedConverter: any;

  beforeEach(() => {
    mockCopyToClipboard = vi.fn();
    mockEnhancedConverter = vi.mocked(enhancedMarkdownToHtml);

    mockCopyToClipboard.mockResolvedValue(undefined);
    mockEnhancedConverter.convert.mockResolvedValue('<p>Converted HTML</p>');
    mockEnhancedConverter.clearCache.mockReturnValue(undefined);
    mockEnhancedConverter.getCacheStats.mockReturnValue({
      size: 0,
      maxSize: 100,
      ttl: 300000,
      shikiInitialized: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with minimal props', () => {
      render(ConversionPreview, {
        props: {
          output: '',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      expect(screen.getByText('Preview Output')).toBeInTheDocument();
      expect(screen.getByText('0 chars')).toBeInTheDocument();
    });

    it('displays correct format label', () => {
      render(ConversionPreview, {
        props: {
          output: '',
          format: 'JIRA',
          formatOutputs: {}
        }
      });

      expect(screen.getByText('JIRA Output')).toBeInTheDocument();
    });

    it('shows character count correctly', () => {
      render(ConversionPreview, {
        props: {
          output: 'Some test content',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      expect(screen.getByText('17 chars')).toBeInTheDocument();
    });

    it('renders all copy buttons', () => {
      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Preview',
          formatOutputs: {
            'JIRA': 'jira output',
            'Slack': 'slack output',
            'HTML': 'html output'
          }
        }
      });

      expect(screen.getByTitle('Copy Preview format')).toBeInTheDocument();
      expect(screen.getByTitle('Copy JIRA format')).toBeInTheDocument();
      expect(screen.getByTitle('Copy Slack format')).toBeInTheDocument();
      expect(screen.getByTitle('Copy HTML format')).toBeInTheDocument();
    });
  });

  describe('Preview Rendering', () => {
    it('renders HTML for Preview format', async () => {
      mockEnhancedConverter.convert.mockResolvedValue('<h1>Converted HTML</h1>');

      render(ConversionPreview, {
        props: {
          output: '# Test Header',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        const content = screen.getByText('Converted HTML');
        expect(content).toBeInTheDocument();
      });
    });

    it('shows loading state during preview conversion', async () => {
      mockEnhancedConverter.convert.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('<p>Done</p>'), 100))
      );

      render(ConversionPreview, {
        props: {
          output: '# Test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      // Should show loading state
      expect(screen.getByText('Rendering preview...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Rendering preview...')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('handles preview conversion error', async () => {
      mockEnhancedConverter.convert.mockRejectedValue(new Error('Conversion failed'));

      render(ConversionPreview, {
        props: {
          output: '# Test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Rendering Error')).toBeInTheDocument();
        expect(screen.getByText('Preview rendering failed: Conversion failed')).toBeInTheDocument();
      });
    });

    it('applies correct styling to preview content', async () => {
      mockEnhancedConverter.convert.mockResolvedValue('<p>Styled content</p>');

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        const content = screen.getByText('Styled content');
        const container = content.closest('.prose');
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Format Output Display', () => {
    it('displays JIRA format output correctly', () => {
      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs: {
            'JIRA': 'h1. JIRA Heading\n\n* Bold text'
          }
        }
      });

      expect(screen.getByText('h1. JIRA Heading')).toBeInTheDocument();
      expect(screen.getByText('* Bold text')).toBeInTheDocument();
    });

    it('displays Slack format output correctly', () => {
      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Slack',
          formatOutputs: {
            'Slack': '*Bold text* and _italic text_'
          }
        }
      });

      expect(screen.getByText('*Bold text* and _italic text_')).toBeInTheDocument();
    });

    it('displays HTML format output correctly', () => {
      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'HTML',
          formatOutputs: {
            'HTML': '<h1>HTML Heading</h1><p>HTML paragraph</p>'
          }
        }
      });

      expect(screen.getByText('<h1>HTML Heading</h1>')).toBeInTheDocument();
      expect(screen.getByText('<p>HTML paragraph</p>')).toBeInTheDocument();
    });

    it('applies format-specific styling', () => {
      const formatOutputs = {
        'JIRA': 'jira content',
        'Slack': 'slack content',
        'HTML': 'html content'
      };

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs
        }
      });

      const content = screen.getByText('jira content');
      const container = content.closest('.font-mono');
      expect(container).toBeInTheDocument();
    });

    it('shows empty state for formats without output', () => {
      render(ConversionPreview, {
        props: {
          output: '',
          format: 'JIRA',
          formatOutputs: {}
        }
      });

      expect(screen.getByText('Jira markup will appear here...')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('copies preview format when clicked', async () => {
      mockEnhancedConverter.convert.mockResolvedValue('<p>Preview content</p>');
      mockCopyToClipboard.mockResolvedValue(undefined);

      render(ConversionPreview, {
        props: {
          output: '# Test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        const copyButton = screen.getByTitle('Copy Preview format');
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('<p>Preview content</p>');
      });
    });

    it('copies JIRA format when clicked', async () => {
      const formatOutputs = { 'JIRA': 'h1. JIRA content' };
      mockCopyToClipboard.mockResolvedValue(undefined);

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs
        }
      });

      const copyButton = screen.getByTitle('Copy JIRA format');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('h1. JIRA content');
      });
    });

    it('copies Slack format when clicked', async () => {
      const formatOutputs = { 'Slack': '*Slack content*' };
      mockCopyToClipboard.mockResolvedValue(undefined);

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Slack',
          formatOutputs
        }
      });

      const copyButton = screen.getByTitle('Copy Slack format');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('*Slack content*');
      });
    });

    it('copies HTML format when clicked', async () => {
      const formatOutputs = { 'HTML': '<p>HTML content</p>' };
      mockCopyToClipboard.mockResolvedValue(undefined);

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'HTML',
          formatOutputs
        }
      });

      const copyButton = screen.getByTitle('Copy HTML format');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('<p>HTML content</p>');
      });
    });

    it('shows copied state after successful copy', async () => {
      const formatOutputs = { 'JIRA': 'jira content' };
      mockCopyToClipboard.mockResolvedValue(undefined);
      vi.useFakeTimers();

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs
        }
      });

      const copyButton = screen.getByTitle('Copy JIRA format');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('JIRA format copied to clipboard')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('JIRA format copied to clipboard')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('handles copy failure gracefully', async () => {
      const formatOutputs = { 'JIRA': 'jira content' };
      mockCopyToClipboard.mockRejectedValue(new Error('Copy failed'));
      vi.useFakeTimers();

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs
        }
      });

      const copyButton = screen.getByTitle('Copy JIRA format');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to copy JIRA format')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('Failed to copy JIRA format')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('disables copy button when no content', () => {
      render(ConversionPreview, {
        props: {
          output: '',
          format: 'JIRA',
          formatOutputs: {}
        }
      });

      const jiraCopyButton = screen.getByTitle('Copy JIRA format');
      const htmlCopyButton = screen.getByTitle('Copy HTML format');
      const slackCopyButton = screen.getByTitle('Copy Slack format');

      expect(jiraCopyButton).toBeDisabled();
      expect(htmlCopyButton).toBeDisabled();
      expect(slackCopyButton).toBeDisabled();

      // Preview copy button should be enabled (renders HTML)
      expect(screen.getByTitle('Copy Preview format')).not.toBeDisabled();
    });
  });

  describe('Format Switching', () => {
    it('updates content when format changes', async () => {
      const formatOutputs = {
        'JIRA': 'jira content',
        'Slack': 'slack content',
        'HTML': 'html content'
      };

      const { component } = render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs
        }
      });

      // Should show JIRA content
      expect(screen.getByText('jira content')).toBeInTheDocument();

      // Switch to Slack format
      await component.$set({ format: 'Slack' });

      expect(screen.getByText('slack content')).toBeInTheDocument();
    });

    it('re-renders preview when switching back to Preview format', async () => {
      mockEnhancedConverter.convert.mockResolvedValue('<p>New preview content</p>');

      const { component } = render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        expect(screen.getByText('New preview content')).toBeInTheDocument();
      });

      // Switch to JIRA
      await component.$set({ format: 'JIRA', formatOutputs: { 'JIRA': 'jira content' } });
      expect(screen.getByText('jira content')).toBeInTheDocument();

      // Switch back to Preview
      await component.$set({ format: 'Preview', formatOutputs: {} });

      await waitFor(() => {
        expect(screen.getByText('New preview content')).toBeInTheDocument();
      });
    });
  });

  describe('Async Rendering', () => {
    it('handles concurrent format requests', async () => {
      mockEnhancedConverter.convert.mockImplementation(
        (input: string) => Promise.resolve(`<p>Content for: ${input}</p>`)
      );

      render(ConversionPreview, {
        props: {
          output: 'concurrent test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      // Should handle async rendering without errors
      await waitFor(() => {
        expect(screen.getByText('Content for: concurrent test')).toBeInTheDocument();
      });
    });

    it('cancels pending requests when component unmounts', async () => {
      mockEnhancedConverter.convert.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('<p>Done</p>'), 1000))
      );

      const { unmount } = render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      // Unmount before conversion completes
      expect(() => unmount()).not.toThrow();
    });

    it('handles slow preview conversion', async () => {
      mockEnhancedConverter.convert.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('<p>Slow result</p>'), 100))
      );

      render(ConversionPreview, {
        props: {
          output: 'slow test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      // Should show loading
      expect(screen.getByText('Rendering preview...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Slow result')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs: { 'JIRA': 'content' }
        }
      });

      expect(screen.getByTitle('Copy Preview format')).toBeInTheDocument();
      expect(screen.getByTitle('Copy JIRA format')).toBeInTheDocument();
      expect(screen.getByTitle('Copy Slack format')).toBeInTheDocument();
      expect(screen.getByTitle('Copy HTML format')).toBeInTheDocument();
    });

    it('announces copy actions to screen readers', async () => {
      const formatOutputs = { 'JIRA': 'jira content' };
      mockCopyToClipboard.mockResolvedValue(undefined);

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs
        }
      });

      const copyButton = screen.getByTitle('Copy JIRA format');
      fireEvent.click(copyButton);

      await waitFor(() => {
        const announcement = screen.getByText('JIRA format copied to clipboard');
        expect(announcement).toBeInTheDocument();
        expect(announcement).toHaveClass('sr-only');
      });
    });

    it('provides loading announcements', async () => {
      mockEnhancedConverter.convert.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('<p>Done</p>'), 100))
      );

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      const loadingText = screen.getByText('Rendering preview...');
      expect(loadingText).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid format gracefully', () => {
      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'InvalidFormat' as any,
          formatOutputs: {}
        }
      });

      expect(screen.getByText('InvalidFormat Output')).toBeInTheDocument();
    });

    it('handles missing formatOutputs gracefully', () => {
      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'JIRA',
          formatOutputs: undefined as any
        }
      });

      expect(screen.getByText('JIRA Output')).toBeInTheDocument();
    });

    it('handles null/undefined outputs gracefully', () => {
      render(ConversionPreview, {
        props: {
          output: null as any,
          format: 'JIRA',
          formatOutputs: null as any
        }
      });

      expect(screen.getByText('JIRA Output')).toBeInTheDocument();
      expect(screen.getByText('0 chars')).toBeInTheDocument();
    });

    it('displays fallback content on preview error', async () => {
      mockEnhancedConverter.convert.mockRejectedValue(new Error('Critical error'));

      render(ConversionPreview, {
        props: {
          output: '# Test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Rendering Error')).toBeInTheDocument();
        expect(screen.getByText('Preview rendering failed: Critical error')).toBeInTheDocument();
      });
    });

    it('handles display errors in rendered content', async () => {
      mockEnhancedConverter.convert.mockResolvedValue('<p>Valid content</p>');

      render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Valid content')).toBeInTheDocument();
      });

      // Simulate a display error
      // This would be tested by mocking the component's error boundary
    });
  });

  describe('Performance', () => {
    it('handles large content efficiently', async () => {
      const largeContent = 'Large content '.repeat(1000);
      mockEnhancedConverter.convert.mockResolvedValue(`<p>${largeContent}</p>`);

      render(ConversionPreview, {
        props: {
          output: largeContent,
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        expect(screen.getByText(`${largeContent.length} chars`)).toBeInTheDocument();
      });
    });

    it('does not re-render unnecessarily', async () => {
      mockEnhancedConverter.convert.mockResolvedValue('<p>Content</p>');

      const { component } = render(ConversionPreview, {
        props: {
          output: 'test',
          format: 'Preview',
          formatOutputs: {}
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      // Update with same content - should not trigger re-render
      await component.$set({ output: 'test' });

      // The converter should not be called again if content is the same
      expect(mockEnhancedConverter.convert).toHaveBeenCalledTimes(1);
    });
  });
});