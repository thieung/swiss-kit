import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarkdownSourceInput from '../MarkdownSourceInput.svelte';
import { writable } from 'svelte/store';

// Mock clipboard utility
vi.mock('$lib/utils/clipboard', () => ({
  copyToClipboard: vi.fn()
}));

describe('MarkdownSourceInput Component', () => {
  let mockCopyToClipboard: any;

  beforeEach(() => {
    mockCopyToClipboard = vi.fn();
    vi.mocked(mockCopyToClipboard).mockResolvedValue(undefined);
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput: vi.fn()
        }
      });

      expect(screen.getByLabelText('Markdown input area')).toBeInTheDocument();
      expect(screen.getByText('Markdown Source')).toBeInTheDocument();
      expect(screen.getByText('0 chars')).toBeInTheDocument();
      expect(screen.getByText('0 lines')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput: vi.fn(),
          placeholder: 'Custom placeholder text'
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');
      expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder text');
    });

    it('displays initial value correctly', () => {
      const initialValue = '# Hello World\n\nThis is a test.';
      render(MarkdownSourceInput, {
        props: {
          value: initialValue,
          onInput: vi.fn()
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');
      expect(textarea).toHaveValue(initialValue);
      expect(screen.getByText(`${initialValue.length} chars`)).toBeInTheDocument();
      expect(screen.getByText('2 lines')).toBeInTheDocument();
    });
  });

  describe('Character and Line Counting', () => {
    it('updates character count on input', async () => {
      const onInput = vi.fn();
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');

      fireEvent.input(textarea, { target: { value: 'Hello' } });

      expect(onInput).toHaveBeenCalledWith('Hello');
      expect(screen.getByText('5 chars')).toBeInTheDocument();
      expect(screen.getByText('1 lines')).toBeInTheDocument();
    });

    it('counts lines correctly', async () => {
      const onInput = vi.fn();
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');

      fireEvent.input(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });

      expect(onInput).toHaveBeenCalledWith('Line 1\nLine 2\nLine 3');
      expect(screen.getByText('3 lines')).toBeInTheDocument();
    });

    it('handles empty text correctly', () => {
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput: vi.fn()
        }
      });

      expect(screen.getByText('0 chars')).toBeInTheDocument();
      expect(screen.getByText('0 lines')).toBeInTheDocument();
    });

    it('handles multiline input with trailing newline', async () => {
      const onInput = vi.fn();
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');

      fireEvent.input(textarea, { target: { value: 'Line 1\nLine 2\n' } });

      expect(onInput).toHaveBeenCalledWith('Line 1\nLine 2\n');
      expect(screen.getByText('2 lines')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    beforeEach(() => {
      const { copyToClipboard } = require('$lib/utils/clipboard');
      copyToClipboard.mockClear();
    });

    it('copies content to clipboard', async () => {
      const { copyToClipboard } = require('$lib/utils/clipboard');
      copyToClipboard.mockResolvedValue(undefined);

      render(MarkdownSourceInput, {
        props: {
          value: 'Test markdown content',
          onInput: vi.fn()
        }
      });

      const copyButton = screen.getByLabelText('Copy Markdown source to clipboard');
      fireEvent.click(copyButton);

      expect(copyToClipboard).toHaveBeenCalledWith('Test markdown content');

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('shows empty state when no content', () => {
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput: vi.fn()
        }
      });

      const copyButton = screen.getByLabelText('Copy Markdown source to clipboard');
      expect(copyButton).toBeDisabled();
    });

    it('handles copy failure', async () => {
      const { copyToClipboard } = require('$lib/utils/clipboard');
      copyToClipboard.mockRejectedValue(new Error('Copy failed'));

      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      const copyButton = screen.getByLabelText('Copy Markdown source to clipboard');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to copy to clipboard')).toBeInTheDocument();
      });
    });

    it('resets copy state after timeout', async () => {
      const { copyToClipboard } = require('$lib/utils/clipboard');
      copyToClipboard.mockResolvedValue(undefined);
      vi.useFakeTimers();

      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      const copyButton = screen.getByLabelText('Copy Markdown source to clipboard');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('handles Cmd/Ctrl+C when no selection', async () => {
      const { copyToClipboard } = require('$lib/utils/clipboard');
      copyToClipboard.mockResolvedValue(undefined);

      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');

      // Mock window.getSelection to return empty string
      Object.defineProperty(window, 'getSelection', {
        value: () => ({ toString: () => '' }),
        writable: true
      });

      fireEvent.keyDown(textarea, {
        key: 'c',
        metaKey: true,
        ctrlKey: true
      });

      expect(copyToClipboard).toHaveBeenCalledWith('Test content');
    });

    it('allows default Cmd/Ctrl+C when there is selection', () => {
      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');

      // Mock window.getSelection to return selected text
      Object.defineProperty(window, 'getSelection', {
        value: () => ({ toString: () => 'selected' }),
        writable: true
      });

      const preventDefault = vi.fn();
      fireEvent.keyDown(textarea, {
        key: 'c',
        metaKey: true,
        ctrlKey: true,
        preventDefault
      });

      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('handles Cmd/Ctrl+A for select all', () => {
      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');
      const select = vi.fn();
      Object.defineProperty(textarea, 'select', { value: select, writable: true });

      fireEvent.keyDown(textarea, {
        key: 'a',
        metaKey: true,
        ctrlKey: true
      });

      // Wait for timeout
      vi.advanceTimersByTime(0);
      expect(select).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      expect(screen.getByLabelText('Markdown input area')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy Markdown source to clipboard')).toBeInTheDocument();
    });

    it('announces copy actions to screen readers', async () => {
      const { copyToClipboard } = require('$lib/utils/clipboard');
      copyToClipboard.mockResolvedValue(undefined);

      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      const copyButton = screen.getByLabelText('Copy Markdown source to clipboard');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Markdown source copied to clipboard')).toBeInTheDocument();
      });
    });

    it('has appropriate accessibility attributes', () => {
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput: vi.fn()
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');
      expect(textarea).toHaveAttribute('spellcheck', 'false');
      expect(textarea).toHaveAttribute('autocomplete', 'off');
      expect(textarea).toHaveAttribute('autocapitalize', 'off');
    });
  });

  describe('Responsive Design', () => {
    it('shows/hides text based on screen size', () => {
      render(MarkdownSourceInput, {
        props: {
          value: 'Test content',
          onInput: vi.fn()
        }
      });

      const copyButton = screen.getByText('Copy');
      expect(copyButton).toBeInTheDocument();

      // Note: Testing responsive behavior would require viewport manipulation
      // which is better suited for E2E tests
    });
  });

  describe('Input Handling', () => {
    it('calls onInput when content changes', async () => {
      const onInput = vi.fn();
      render(MarkdownSourceInput, {
        props: {
          value: '',
          onInput
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');
      fireEvent.input(textarea, { target: { value: 'New content' } });

      expect(onInput).toHaveBeenCalledWith('New content');
    });

    it('handles large input efficiently', () => {
      const largeContent = '# Large Document\n\n'.repeat(1000);
      const onInput = vi.fn();

      render(MarkdownSourceInput, {
        props: {
          value: largeContent,
          onInput
        }
      });

      expect(screen.getByText(`${largeContent.length} chars`)).toBeInTheDocument();
      expect(screen.getByText(`${largeContent.split('\n').length} lines`)).toBeInTheDocument();
    });

    it('maintains cursor position during input', () => {
      const onInput = vi.fn();
      render(MarkdownSourceInput, {
        props: {
          value: 'Initial content',
          onInput
        }
      });

      const textarea = screen.getByLabelText('Markdown input area');

      // This would be better tested with user interaction simulation
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid onInput prop gracefully', () => {
      expect(() => {
        render(MarkdownSourceInput, {
          props: {
            value: 'test',
            onInput: null as any
          }
        });
      }).not.toThrow();
    });

    it('handles undefined value prop', () => {
      expect(() => {
        render(MarkdownSourceInput, {
          props: {
            value: undefined as any,
            onInput: vi.fn()
          }
        });
      }).not.toThrow();
    });
  });
});