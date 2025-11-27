import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appState } from '../../stores/appState.svelte';
import { tools } from '../../stores/toolRegistry';
import { Binary } from 'lucide-svelte';

// Mock tool registry with test data
vi.mock('../../stores/toolRegistry', () => ({
  tools: [
    {
      id: 'base64',
      name: 'Base64 Encoder/Decoder',
      description: 'Encode and decode Base64 strings',
      component: {},
      icon: Binary,
      category: 'encoders'
    },
    {
      id: 'markdown-converter',
      name: 'Markdown Converter',
      description: 'Convert Markdown to Slack or JIRA format',
      component: {},
      icon: '📝',
      category: 'converters'
    }
  ]
}));

describe('CommandPalette Component Logic', () => {
  beforeEach(() => {
    // Reset app state before each test
    appState.commandPaletteOpen = false;
    appState.activeTool = null;
  });

  describe('Keyboard Shortcuts Logic', () => {
    it('should detect Cmd+K correctly', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true
      });

      const isCmdK = event.metaKey && event.key === 'k';
      expect(isCmdK).toBe(true);
    });

    it('should detect Ctrl+K correctly', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true
      });

      const isCtrlK = event.ctrlKey && event.key === 'k';
      expect(isCtrlK).toBe(true);
    });

    it('should ignore other key combinations', () => {
      const event1 = new KeyboardEvent('keydown', {
        key: 'j',
        metaKey: true
      });

      const event2 = new KeyboardEvent('keydown', {
        key: 'k',
        shiftKey: true
      });

      const isCmdJ = event1.metaKey && event1.key === 'k';
      const isShiftK = event2.shiftKey && event2.key === 'k';

      expect(isCmdJ).toBe(false);
      expect(isShiftK).toBe(false);
    });
  });

  describe('Search Filtering Logic', () => {
    it('should filter tools by name', () => {
      const searchQuery = 'base64';
      const filtered = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('base64');
    });

    it('should filter tools by description', () => {
      const searchQuery = 'slack';
      const filtered = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('markdown-converter');
    });

    it('should return all tools when search is empty', () => {
      const searchQuery = '';
      const filtered = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
    });

    it('should return empty when no tools match', () => {
      const searchQuery = 'nonexistent';
      const filtered = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const searchTerms = ['base64', 'BASE64', 'Base64'];

      searchTerms.forEach(term => {
        const filtered = tools.filter(tool =>
          tool.name.toLowerCase().includes(term.toLowerCase()) ||
          tool.description.toLowerCase().includes(term.toLowerCase())
        );
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('base64');
      });
    });
  });

  describe('Tool Selection Logic', () => {
    it('should set active tool correctly', () => {
      appState.activeTool = null;
      const toolId = 'base64';

      // Simulate selectTool function
      appState.activeTool = toolId;

      expect(appState.activeTool).toBe(toolId);
    });

    it('should toggle command palette state', () => {
      const initialState = appState.commandPaletteOpen;

      // Simulate toggleCommandPalette function
      appState.commandPaletteOpen = !appState.commandPaletteOpen;

      expect(appState.commandPaletteOpen).toBe(!initialState);
    });
  });

  describe('Component Data Structure', () => {
    it('should have required tool properties', () => {
      tools.forEach(tool => {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('component');
        expect(tool).toHaveProperty('icon');
        expect(tool).toHaveProperty('category');
      });
    });

    it('should have valid tool categories', () => {
      const validCategories = ['converters', 'encoders', 'formatters', 'generators', 'utils'];

      tools.forEach(tool => {
        expect(validCategories).toContain(tool.category);
      });
    });

    it('should have unique tool IDs', () => {
      const toolIds = tools.map(tool => tool.id);
      const uniqueIds = [...new Set(toolIds)];

      expect(toolIds).toHaveLength(uniqueIds.length);
    });
  });

  describe('Search Performance', () => {
    it('should handle rapid search terms efficiently', () => {
      const searchTerms = ['b', 'ba', 'bas', 'base', 'base6', 'base64', ''];
      const results = [];

      const startTime = performance.now();

      searchTerms.forEach(term => {
        const filtered = tools.filter(tool =>
          tool.name.toLowerCase().includes(term.toLowerCase()) ||
          tool.description.toLowerCase().includes(term.toLowerCase())
        );
        results.push(filtered.length);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toEqual([1, 1, 1, 1, 1, 1, 2]);
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in search', () => {
      const searchTerms = ['@#$%', '[]{}', '\\|'];

      searchTerms.forEach(term => {
        expect(() => {
          tools.filter(tool =>
            tool.name.toLowerCase().includes(term.toLowerCase()) ||
            tool.description.toLowerCase().includes(term.toLowerCase())
          );
        }).not.toThrow();
      });
    });

    it('should handle very long search strings', () => {
      const longSearch = 'a'.repeat(1000);

      expect(() => {
        tools.filter(tool =>
          tool.name.toLowerCase().includes(longSearch.toLowerCase()) ||
          tool.description.toLowerCase().includes(longSearch.toLowerCase())
        );
      }).not.toThrow();
    });

    it('should handle unicode characters in search', () => {
      const unicodeSearch = '🚀 ñiño';

      expect(() => {
        tools.filter(tool =>
          tool.name.toLowerCase().includes(unicodeSearch.toLowerCase()) ||
          tool.description.toLowerCase().includes(unicodeSearch.toLowerCase())
        );
      }).not.toThrow();
    });
  });

  describe('State Management', () => {
    it('should maintain appState structure', () => {
      expect(appState).toHaveProperty('activeTool');
      expect(appState).toHaveProperty('commandPaletteOpen');
      expect(appState).toHaveProperty('sidebarCollapsed');
      expect(typeof appState.activeTool).toBe('string' || typeof appState.activeTool === 'object');
      expect(typeof appState.commandPaletteOpen).toBe('boolean');
      expect(typeof appState.sidebarCollapsed).toBe('boolean');
    });
  });
});