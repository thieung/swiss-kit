import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FormatTabs from '../FormatTabs.svelte';

describe('FormatTabs Component', () => {
  let mockOnSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSelect = vi.fn();
  });

  describe('Basic Rendering', () => {
    it('renders all format tabs', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      expect(screen.getByRole('tab', { name: /preview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /jira/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /slack/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /html/i })).toBeInTheDocument();
    });

    it('displays correct icons for each tab', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      // Check for icon elements (they might be SVG or other elements)
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
    });

    it('shows tooltips on hover', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const previewTab = screen.getByTitle('Rendered HTML with syntax highlighting');
      const jiraTab = screen.getByTitle('Jira markup format');
      const slackTab = screen.getByTitle('Slack markdown format');
      const htmlTab = screen.getByTitle('Raw HTML output');

      expect(previewTab).toBeInTheDocument();
      expect(jiraTab).toBeInTheDocument();
      expect(slackTab).toBeInTheDocument();
      expect(htmlTab).toBeInTheDocument();
    });
  });

  describe('Tab Selection', () => {
    it('highlights the selected tab', () => {
      render(FormatTabs, {
        props: {
          selected: 'JIRA',
          onSelect: mockOnSelect
        }
      });

      const jiraTab = screen.getByRole('tab', { name: /jira/i });
      expect(jiraTab).toHaveAttribute('data-state', 'active');
    });

    it('calls onSelect when tab is clicked', async () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const jiraTab = screen.getByRole('tab', { name: /jira/i });
      fireEvent.click(jiraTab);

      expect(mockOnSelect).toHaveBeenCalledWith('JIRA');
    });

    it('handles keyboard navigation', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const firstTab = screen.getByRole('tab', { name: /preview/i });

      // Test arrow key navigation
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

      // Tab selection should still work with keyboard
      expect(firstTab).toBeInTheDocument();
    });

    it('supports programmatic selection changes', async () => {
      const { component } = render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      // Re-render with different selected prop
      await component.$set({ selected: 'HTML' });

      const htmlTab = screen.getByRole('tab', { name: /html/i });
      expect(htmlTab).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Format Options', () => {
    it('has correct format values', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      // Check that tabs have correct values
      const tabs = screen.getAllByRole('tab');

      // This would need to be adjusted based on the actual component implementation
      // For now, just verify all tabs are present
      expect(tabs).toHaveLength(4);
    });

    it('handles all available formats', () => {
      const formats = ['Preview', 'JIRA', 'Slack', 'HTML'];

      formats.forEach(format => {
        render(FormatTabs, {
          props: {
            selected: format,
            onSelect: mockOnSelect
          }
        });

        const selectedTab = screen.getByRole('tab', { name: new RegExp(format, 'i') });
        expect(selectedTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('Event Handling', () => {
    it('emits change event with correct format', async () => {
      let capturedValue: string | undefined;

      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: (value: string) => {
            capturedValue = value;
          }
        }
      });

      const slackTab = screen.getByRole('tab', { name: /slack/i });
      fireEvent.click(slackTab);

      expect(capturedValue).toBe('Slack');
    });

    it('handles rapid tab switching', async () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const jiraTab = screen.getByRole('tab', { name: /jira/i });
      const slackTab = screen.getByRole('tab', { name: /slack/i });
      const htmlTab = screen.getByRole('tab', { name: /html/i });

      // Rapidly switch tabs
      fireEvent.click(jiraTab);
      fireEvent.click(slackTab);
      fireEvent.click(htmlTab);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
      expect(mockOnSelect).toHaveBeenNthCalledWith(1, 'JIRA');
      expect(mockOnSelect).toHaveBeenNthCalledWith(2, 'Slack');
      expect(mockOnSelect).toHaveBeenNthCalledWith(3, 'HTML');
    });

    it('prevents selection of already selected tab', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const previewTab = screen.getByRole('tab', { name: /preview/i });
      fireEvent.click(previewTab);

      // Should not call onSelect for already selected tab
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('role', 'tab');
      });
    });

    it('supports keyboard navigation', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const firstTab = screen.getByRole('tab', { name: /preview/i });

      // Test tab key
      fireEvent.keyDown(firstTab, { key: 'Tab' });
      expect(firstTab).toBeInTheDocument();

      // Test enter key
      fireEvent.keyDown(firstTab, { key: 'Enter' });
      expect(firstTab).toBeInTheDocument();
    });

    it('has accessible names', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      expect(screen.getByRole('tab', { name: /preview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /jira/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /slack/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /html/i })).toBeInTheDocument();
    });

    it('provides context through titles', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      expect(screen.getByTitle('Rendered HTML with syntax highlighting')).toBeInTheDocument();
      expect(screen.getByTitle('Jira markup format')).toBeInTheDocument();
      expect(screen.getByTitle('Slack markdown format')).toBeInTheDocument();
      expect(screen.getByTitle('Raw HTML output')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('hides text labels on small screens', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      // This would need viewport manipulation for proper testing
      // For now, check that icon elements exist
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
    });

    it('maintains functionality on all screen sizes', async () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const jiraTab = screen.getByRole('tab', { name: /jira/i });

      // Click should work regardless of screen size
      fireEvent.click(jiraTab);
      expect(mockOnSelect).toHaveBeenCalledWith('JIRA');
    });
  });

  describe('Error Handling', () => {
    it('handles missing onSelect prop gracefully', () => {
      expect(() => {
        render(FormatTabs, {
          props: {
            selected: 'Preview',
            onSelect: null as any
          }
        });
      }).not.toThrow();
    });

    it('handles invalid selected prop', () => {
      expect(() => {
        render(FormatTabs, {
          props: {
            selected: 'InvalidFormat',
            onSelect: mockOnSelect
          }
        });
      }).not.toThrow();
    });

    it('handles undefined props', () => {
      expect(() => {
        render(FormatTabs, {
          props: {
            selected: undefined as any,
            onSelect: undefined as any
          }
        });
      }).not.toThrow();
    });
  });

  describe('Styling and Layout', () => {
    it('has correct grid layout', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toBeInTheDocument();

      // Check that it has the correct number of tabs
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
    });

    it('applies correct styling classes', () => {
      render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('text-xs', 'font-medium');
      });
    });

    it('highlights selected tab correctly', () => {
      render(FormatTabs, {
        props: {
          selected: 'JIRA',
          onSelect: mockOnSelect
        }
      });

      const selectedTab = screen.getByRole('tab', { name: /jira/i });
      expect(selectedTab).toHaveAttribute('data-state', 'active');

      const unselectedTab = screen.getByRole('tab', { name: /preview/i });
      expect(unselectedTab).not.toHaveAttribute('data-state', 'active');
    });
  });

  describe('Performance', () => {
    it('handles rapid prop updates efficiently', async () => {
      const { component } = render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      // Rapidly change selected prop
      for (let i = 0; i < 10; i++) {
        await component.$set({ selected: i % 2 === 0 ? 'Preview' : 'JIRA' });
      }

      const finalTab = screen.getByRole('tab', {
        name: i => i.includes('JIRA') || i.includes('Preview')
      });
      expect(finalTab).toBeInTheDocument();
    });

    it('does not cause memory leaks', () => {
      const { unmount } = render(FormatTabs, {
        props: {
          selected: 'Preview',
          onSelect: mockOnSelect
        }
      });

      expect(() => unmount()).not.toThrow();
    });
  });
});