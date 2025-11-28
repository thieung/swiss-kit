<script lang="ts">
  import { Sun, Moon, Monitor } from 'lucide-svelte';
  import { appState, setTheme } from '$lib/stores/appState.svelte';

  type ThemeMode = 'light' | 'dark' | 'system';

  let isOpen = $state(false);

  function handleThemeSelect(mode: ThemeMode) {
    setTheme(mode);
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.theme-toggle-container')) {
      isOpen = false;
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const themeLabels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  };
</script>

<div class="theme-toggle-container relative">
  <button
    onclick={toggleDropdown}
    class="flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent transition-colors"
    aria-label="Toggle theme"
    type="button"
  >
    {#if appState.themeMode === 'light'}
      <Sun class="w-5 h-5" />
    {:else if appState.themeMode === 'dark'}
      <Moon class="w-5 h-5" />
    {:else}
      <Monitor class="w-5 h-5" />
    {/if}
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 mt-2 w-36 bg-popover text-popover-foreground rounded-md shadow-lg border border-border overflow-hidden z-50"
    >
      <div class="py-1">
        {#each ['light', 'dark', 'system'] as mode}
          {@const Icon = themeIcons[mode as ThemeMode]}
          <button
            onclick={() => handleThemeSelect(mode as ThemeMode)}
            class="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors {appState.themeMode === mode ? 'bg-accent' : ''}"
            type="button"
          >
            <Icon class="w-4 h-4" />
            <span>{themeLabels[mode as ThemeMode]}</span>
            {#if appState.themeMode === mode}
              <span class="ml-auto text-xs">✓</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .theme-toggle-container {
    position: relative;
  }
</style>
