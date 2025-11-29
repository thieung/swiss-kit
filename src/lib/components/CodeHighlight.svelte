<script lang="ts">
  /**
   * Props for CodeHighlight component (formerly PrismHighlight)
   */
  interface Props {
    /** Code content to display */
    code: string;
    /** Language identifier for syntax highlighting (for styling purposes) */
    language: string;
  }

  let { code, language }: Props = $props();

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

  /**
   * Escaped code for safe HTML rendering
   */
  let escapedCode = $derived.by(() => escapeHtml(code));
</script>

<pre><code class="language-{language}">{escapedCode}</code></pre>