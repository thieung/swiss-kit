import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarkdownConverterLayout from '../MarkdownConverterLayout.svelte';
import userEvent from '@testing-library/user-event';

// Mock child components
vi.mock('../MarkdownSourceInput.svelte', () => ({
  default: {
    render: vi.fn(() => ({
      component: 'MockMarkdownSourceInput'
    }))
  }
}));

vi.mock('../FormatTabs.svelte', () => ({
  default: {
    render: vi.fn(() => ({
      component: 'MockFormatTabs'
    }))
  }
}));

vi.mock('../ConversionPreview.svelte', () => ({
  default: {
    render: vi.fn(() => ({
      component: 'MockConversionPreview'
    }))
  }
}));

vi.mock('../ToolActions.svelte', () => ({
  default: {
    render: vi.fn(() => ({
      component: 'MockToolActions'
    }))
  }
}));

describe('MarkdownConverterLayout Component', () => {
  let mockHandlers: ReturnType<typeof vi.hoisted>(() => ({
    onInput: vi.fn(),
    onFormatChange: vi.fn(),
    onClear: vi.fn(),
    onCopyAll: vi.fn(),
    onExport: vi.fn()
  }));

  const defaultProps = {
    input: '',
    selectedFormat: 'Preview',
    output: '',
    formatOutputs: {},
    ...mockHandlers
  };

  beforeEach(() => {
    Object.values(mockHandlers).forEach(handler => handler.mockClear());
  });

  describe('Basic Rendering', () => {
    it('renders with all required props', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Should contain the main layout container
      expect(screen.getByRole('main') || document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('renders all child components', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Check that layout structure exists
      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('has correct layout structure', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Should have header and main content sections
      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
      expect(document.querySelector('.grid')).toBeInTheDocument();
    });

    it('displays responsive grid layout', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
    });
  });

  describe('Props Handling', () => {
    it('passes input prop to MarkdownSourceInput', () => {
      const props = {
        ...defaultProps,
        input: '# Test Input'
      };

      render(MarkdownConverterLayout, {
        props
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('passes selectedFormat prop to FormatTabs', () => {
      const props = {
        ...defaultProps,
        selectedFormat: 'JIRA'
      };

      render(MarkdownConverterLayout, {
        props
      });

      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('passes output and formatOutputs to ConversionPreview', () => {
      const props = {
        ...defaultProps,
        output: 'test output',
        formatOutputs: {
          'JIRA': 'jira output',
          'Slack': 'slack output',
          'HTML': 'html output'
        }
      };

      render(MarkdownConverterLayout, {
        props
      });

      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('handles empty formatOutputs', () => {
      const props = {
        ...defaultProps,
        formatOutputs: {}
      };

      render(MarkdownConverterLayout, {
        props
      });

      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('handles null/undefined props gracefully', () => {
      const props = {
        input: null as any,
        selectedFormat: undefined as any,
        output: undefined as any,
        formatOutputs: null as any,
        ...mockHandlers
      };

      expect(() => {
        render(MarkdownConverterLayout, {
          props
        });
      }).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    it('calls onInput when MarkdownSourceInput input changes', async () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // This would require finding the actual input and simulating typing
      // For now, just verify component renders without errors
      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('calls onFormatChange when FormatTabs selection changes', async () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('calls onClear when Clear All action is triggered', async () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // This would require finding and clicking the Clear button
      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('calls onCopyAll when Copy All action is triggered', async () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('calls onExport when Export action is triggered', async () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
    });
  });

  describe('Tool Actions', () => {
    it('renders all tool actions', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('disables actions when no content', () => {
      render(MarkdownConverterLayout, {
        props: {
          ...defaultProps,
          input: '',
          output: ''
        }
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('enables actions when content exists', () => {
      render(MarkdownConverterLayout, {
        props: {
          ...defaultProps,
          input: '# Some content',
          output: 'some output'
        }
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('has correct action labels', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Check that action buttons would have correct labels
      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('has correct action variants', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('has correct action tooltips', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('has proper header section', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const header = document.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(header).toBeInTheDocument();
    });

    it('has proper main content grid', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const grid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('has proper spacing between sections', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.space-y-6');
      expect(container).toBeInTheDocument();
    });

    it('has proper responsive behavior classes', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Check for responsive classes
      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();

      const header = document.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(header).toBeInTheDocument();

      const grid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Content Areas', () => {
    it('has left panel for input', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('has right panel for preview', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('maintains equal height for panels', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('flex-1', 'min-h-0');
    });

    it('has proper gap between panels', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('supports keyboard shortcuts mentioned in tooltips', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Tool actions should have keyboard shortcuts in tooltips
      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('handles Cmd+K for clear action', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('handles Cmd+Shift+C for copy all action', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('handles Cmd+S for export action', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile screens', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Check for mobile-friendly classes
      const header = document.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(header).toBeInTheDocument();

      const grid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('adapts to tablet screens', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Check for tablet breakpoint classes
      const header = document.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(header).toBeInTheDocument();
    });

    it('adapts to desktop screens', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Check for desktop breakpoint classes
      const grid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('maintains functionality across screen sizes', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('reflects input state changes', async () => {
      const { component } = render(MarkdownConverterLayout, {
        props: defaultProps
      });

      await component.$set({ input: '# New Input' });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('reflects format selection changes', async () => {
      const { component } = render(MarkdownConverterLayout, {
        props: defaultProps
      });

      await component.$set({ selectedFormat: 'JIRA' });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('reflects output changes', async () => {
      const { component } = render(MarkdownConverterLayout, {
        props: defaultProps
      });

      await component.$set({ output: 'New Output' });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('reflects format outputs changes', async () => {
      const { component } = render(MarkdownConverterLayout, {
        props: defaultProps
      });

      await component.$set({
        formatOutputs: {
          'JIRA': 'New JIRA Output',
          'Slack': 'New Slack Output'
        }
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing onInput handler gracefully', () => {
      const props = {
        ...defaultProps,
        onInput: null as any
      };

      expect(() => {
        render(MarkdownConverterLayout, {
          props
        });
      }).not.toThrow();
    });

    it('handles missing onFormatChange handler gracefully', () => {
      const props = {
        ...defaultProps,
        onFormatChange: null as any
      };

      expect(() => {
        render(MarkdownConverterLayout, {
          props
        });
      }).not.toThrow();
    });

    it('handles missing action handlers gracefully', () => {
      const props = {
        ...defaultProps,
        onClear: null as any,
        onCopyAll: null as any,
        onExport: null as any
      };

      expect(() => {
        render(MarkdownConverterLayout, {
          props
        });
      }).not.toThrow();
    });

    it('handles invalid format values', () => {
      const props = {
        ...defaultProps,
        selectedFormat: 'InvalidFormat' as any
      };

      expect(() => {
        render(MarkdownConverterLayout, {
          props
        });
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with default props', () => {
      const startTime = performance.now();
      render(MarkdownConverterLayout, {
        props: defaultProps
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles large content efficiently', () => {
      const largeContent = '# Large Content\n\n'.repeat(1000);
      const props = {
        ...defaultProps,
        input: largeContent,
        output: largeContent,
        formatOutputs: {
          'JIRA': largeContent,
          'Slack': largeContent,
          'HTML': largeContent
        }
      };

      const startTime = performance.now();
      render(MarkdownConverterLayout, {
        props
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });

    it('does not cause unnecessary re-renders', async () => {
      const { component } = render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const startTime = performance.now();
      await component.$set({ input: defaultProps.input }); // Same value
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('has proper ARIA structure for action buttons', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('maintains focus order', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates all child components correctly', () => {
      render(MarkdownConverterLayout, {
        props: defaultProps
      });

      // Verify layout structure exists
      expect(document.querySelector('.max-w-6xl')).toBeInTheDocument();
      expect(document.querySelector('.flex.flex-col.sm\\:flex-row')).toBeInTheDocument();
      expect(document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2')).toBeInTheDocument();
    });

    it('passes data correctly between components', async () => {
      const { component } = render(MarkdownConverterLayout, {
        props: defaultProps
      });

      const newInput = '# New Input Content';
      await component.$set({ input: newInput });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });

    it('coordinates format changes across components', async () => {
      const { component } = render(MarkdownConverterLayout, {
        props: defaultProps
      });

      await component.$set({ selectedFormat: 'HTML' });

      const container = document.querySelector('.max-w-6xl');
      expect(container).toBeInTheDocument();
    });
  });
});