import { invoke } from '@tauri-apps/api/core';

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await invoke('copy_to_clipboard', { text });
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

export async function readFromClipboard(): Promise<string> {
  try {
    return await invoke('read_from_clipboard');
  } catch (error) {
    console.error('Failed to read from clipboard:', error);
    throw error;
  }
}