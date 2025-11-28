import './app.css'
import { mount } from 'svelte'
import App from './App.svelte'
import { initializeTheme } from './lib/stores/appState.svelte'

// Initialize theme before mounting app
initializeTheme()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
