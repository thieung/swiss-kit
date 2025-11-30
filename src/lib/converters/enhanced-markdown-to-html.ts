import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import type { ThemeRegistration } from 'shiki';

// Configuration for enhanced markdown rendering
interface ShikiConfig {
  theme: {
    light: string | ThemeRegistration;
    dark: string | ThemeRegistration;
  };
  languages: string[];
  async: boolean;
}

class EnhancedMarkdownToHtml {
  private md: MarkdownIt;
  private cache = new Map<string, { result: string; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private shikiInitialized = false;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: true
    });

    // Initialize shiki plugin asynchronously
    this.initializeShiki();
  }

  private async initializeShiki() {
    try {
      this.md.use(await Shiki({
        theme: {
          light: 'github-light',
          dark: 'github-dark'
        },
        languages: [
          'javascript',
          'typescript',
          'svelte',
          'rust',
          'python',
          'json',
          'markdown',
          'html',
          'css',
          'bash'
        ]
      }));
      this.shikiInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize Shiki:', error);
      // Fallback to basic markdown-it
      this.shikiInitialized = false;
    }
  }

  async convert(input: string): Promise<string> {
    if (!input?.trim()) {
      return '';
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(input);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    try {
      // Wait for shiki initialization if needed
      if (!this.shikiInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Async rendering with shiki
      const result = await Promise.resolve(this.md.render(input));

      // Cache the result
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Markdown conversion error:', error);
      // Fallback to synchronous rendering
      try {
        return this.md.render(input);
      } catch (fallbackError) {
        throw new Error(`Failed to convert markdown: ${(fallbackError as Error).message}`);
      }
    }
  }

  private generateCacheKey(input: string): string {
    // Simple hash for cache key (could use crypto in production)
    return `${input.substring(0, 100)}_${input.length}`;
  }

  private setCache(key: string, result: string): void {
    // Clean old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  // Method to clear cache (useful for theme changes)
  clearCache(): void {
    this.cache.clear();
  }

  // Get current cache stats for debugging
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
      shikiInitialized: this.shikiInitialized
    };
  }
}

// Export singleton instance
export const enhancedMarkdownToHtml = new EnhancedMarkdownToHtml();

// Export for direct usage
export { EnhancedMarkdownToHtml };