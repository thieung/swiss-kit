<script lang="ts">
  import Prism from 'prismjs';

  /**
   * Props for PrismHighlight component
   */
  interface Props {
    /** Code content to highlight */
    code: string;
    /** Language identifier for syntax highlighting */
    language: string;
  }

  let { code, language }: Props = $props();

  /**
   * Reactively highlighted HTML
   * Recomputes only when code or language changes
   */
  let highlighted = $derived.by(() => {
    // Check if language grammar is loaded
    const grammar = Prism.languages[language];
    if (!grammar) {
      console.warn(`Prism: Language "${language}" not loaded`);
      // Fallback: escape HTML and render unstyled
      return escapeHtml(code);
    }

    try {
      return Prism.highlight(code, grammar, language);
    } catch (err) {
      console.error(`Prism highlight error (${language}):`, err);
      // Fallback: escape HTML and render unstyled
      return escapeHtml(code);
    }
  });

  /**
   * Escapes HTML entities for safe rendering
   * @param text - Text to escape
   * @returns Escaped HTML
   */
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
</script>

<pre><code class="language-{language}">{@html highlighted}</code></pre>