<script>
  import { onMount } from 'svelte';
  import { load } from './lib/entries.svelte.js';
  import { theme, toggleTheme } from './lib/theme.svelte.js';
  import History from './components/History.svelte';
  import Editor from './components/Editor.svelte';
  import Backup from './components/Backup.svelte';

  const tabs = [
    ['history', 'History'],
    ['publish', 'Publish'],
    ['backup', 'Backup']
  ];

  let tab = $state('history');
  let editing = $state(null);

  const index = $derived(tabs.findIndex(([id]) => id === tab));

  onMount(() => {
    if (new URLSearchParams(location.search).get('tab') === 'publish') tab = 'publish';
    load();
    navigator.storage?.persist?.();
  });

  function go(id) {
    tab = id;
    if (id !== 'publish') editing = null;
  }

  function edit(entry) {
    editing = entry;
    tab = 'publish';
  }

  function finish() {
    editing = null;
    tab = 'history';
  }
</script>

<header class="site-header">
  <div class="header-inner">
    <div class="logo">thefacebook<span class="dot"></span></div>
    <button class="btn theme" type="button" onclick={toggleTheme}>
      {theme.mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  </div>
</header>

<main>
  <section class="intro">
    <h1>My history</h1>
    <p>A simple personal record.</p>
  </section>

  <nav class="tabs" style="--i:{index}">
    {#each tabs as [id, label]}
      <button type="button" aria-current={tab === id ? 'page' : undefined} onclick={() => go(id)}>
        {label}
      </button>
    {/each}
  </nav>

  {#key tab}
    <section class="view">
      {#if tab === 'history'}
        <History onedit={edit} onpublish={() => go('publish')} />
      {:else if tab === 'publish'}
        {#key editing?.id}
          <Editor entry={editing} ondone={finish} />
        {/key}
      {:else}
        <Backup />
      {/if}
    </section>
  {/key}
</main>

<footer>
  thefacebook · personal history<br />
  Stored on this device. Works offline after first load.
</footer>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding-top: env(safe-area-inset-top);
    border-bottom: 1px solid var(--line);
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 760px;
    margin: 0 auto;
    padding: 12px 20px;
  }

  .logo {
    display: flex;
    align-items: baseline;
    gap: 3px;
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.045em;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2.8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 var(--glow);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 7px transparent;
      transform: scale(1.25);
    }
  }

  .theme {
    padding: 6px 14px;
    font-size: 12px;
  }

  main {
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 20px 24px;
  }

  .intro {
    margin-bottom: 26px;
    animation: rise 0.7s var(--ease) both;
  }

  .intro h1 {
    font-size: clamp(38px, 8vw, 56px);
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  .intro p {
    margin: 8px 0 0;
    color: var(--muted);
  }

  .tabs {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-bottom: 26px;
    padding: 4px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    isolation: isolate;
    animation: rise 0.7s 0.08s var(--ease) both;
  }

  .tabs::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 4px;
    bottom: 4px;
    left: 4px;
    width: calc((100% - 8px) / 3);
    border-radius: 999px;
    background: var(--accent);
    transform: translateX(calc(var(--i) * 100%));
    transition: transform 0.5s cubic-bezier(0.7, 0, 0.2, 1);
  }

  .tabs button {
    padding: 9px 4px;
    border: 0;
    background: none;
    color: var(--muted);
    font-size: 14px;
    font-weight: 600;
    transition: color 0.3s;
  }

  .tabs button:hover {
    color: var(--text);
  }

  .tabs button[aria-current='page'] {
    color: var(--on-accent);
  }

  .view {
    animation: rise 0.45s var(--ease) both;
  }

  footer {
    max-width: 760px;
    margin: 0 auto;
    padding: 24px 20px calc(40px + env(safe-area-inset-bottom));
    color: var(--muted);
    font-size: 12px;
    line-height: 1.8;
    text-align: center;
  }
</style>
