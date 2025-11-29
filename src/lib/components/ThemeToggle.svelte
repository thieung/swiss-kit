<script lang="ts">
  import { Sun, Moon, Monitor } from 'lucide-svelte';
  import { appState, setTheme } from '$lib/stores/appState.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { buttonVariants } from '$lib/components/ui/button';

  type ThemeMode = 'light' | 'dark' | 'system';

  function handleThemeSelect(mode: ThemeMode) {
    setTheme(mode);
  }

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

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({ variant: 'ghost', size: 'icon' })}
    aria-label="Toggle theme"
  >
    {#if appState.themeMode === 'light'}
      <Sun class="w-4 h-4" />
    {:else if appState.themeMode === 'dark'}
      <Moon class="w-4 h-4" />
    {:else}
      <Monitor class="w-4 h-4" />
    {/if}
  </DropdownMenu.Trigger>

  <DropdownMenu.Content class="w-40">
    {#each ['light', 'dark', 'system'] as mode}
      {@const Icon = themeIcons[mode as ThemeMode]}
      <DropdownMenu.Item
        class="flex items-center gap-3"
        onclick={() => handleThemeSelect(mode as ThemeMode)}
      >
        <Icon class="w-4 h-4" />
        <span>{themeLabels[mode as ThemeMode]}</span>
        {#if appState.themeMode === mode}
          <span class="ml-auto text-xs text-primary">✓</span>
        {/if}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
