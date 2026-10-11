<script>
  import { entries, remove } from '../lib/entries.svelte.js';
  import { wordCount, streak, monthLabel } from '../lib/stats.js';
  import Entry from './Entry.svelte';

  let { onedit, onpublish } = $props();

  let query = $state('');
  let leavingId = $state(null);

  const totalWords = $derived(entries.list.reduce((sum, e) => sum + wordCount(e.body), 0));
  const days = $derived(streak(entries.list));

  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.list;
    return entries.list.filter((e) => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q));
  });

  const months = $derived.by(() => {
    const groups = new Map();
    for (const entry of visible) {
      const key = entry.date.slice(0, 7);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    }
    return [...groups];
  });

  function erase(id) {
    leavingId = id;
    setTimeout(async () => {
      await remove(id);
      leavingId = null;
    }, 260);
  }
</script>

{#if entries.loaded}
  {#if !entries.list.length}
    <div class="panel empty">
      <div class="emblem"><span></span></div>
      <h2>No entries yet.</h2>
      <p>There is nothing here yet. Write the first entry.</p>
      <button class="btn primary" type="button" onclick={onpublish}>Publish an entry</button>
    </div>
  {:else}
    <dl class="stats">
      <div><dt>{entries.list.length === 1 ? 'Entry' : 'Entries'}</dt><dd>{entries.list.length}</dd></div>
      <div><dt>Words</dt><dd>{totalWords.toLocaleString()}</dd></div>
      <div><dt>Day streak</dt><dd>{days}</dd></div>
    </dl>

    <input class="search" type="search" placeholder="Search your history" bind:value={query} />

    {#each months as [key, items] (key)}
      <h2 class="month">{monthLabel(key)}</h2>
      {#each items as entry, i (entry.id)}
        <Entry {entry} index={Math.min(i, 8)} leaving={leavingId === entry.id} {onedit} onremove={erase} />
      {/each}
    {:else}
      <p class="none">Nothing matches “{query.trim()}”.</p>
    {/each}
  {/if}
{/if}

<style>
  .empty {
    padding: 56px 24px;
    text-align: center;
  }

  .empty h2 {
    margin-bottom: 8px;
  }

  .empty p {
    margin: 0 0 24px;
    color: var(--muted);
  }

  .emblem {
    position: relative;
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    margin: 0 auto 24px;
  }

  .emblem span {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
  }

  .emblem::before,
  .emblem::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1.5px solid var(--accent);
    border-radius: 50%;
    opacity: 0;
    animation: ripple 3.2s ease-out infinite;
  }

  .emblem::after {
    animation-delay: 1.6s;
  }

  @keyframes ripple {
    from {
      transform: scale(0.25);
      opacity: 0.8;
    }
    to {
      transform: scale(1);
      opacity: 0;
    }
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 0 0 18px;
  }

  .stats div {
    display: flex;
    flex-direction: column-reverse;
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--surface);
  }

  .stats dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: 30px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .stats dt {
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .search {
    width: 100%;
    margin-bottom: 8px;
    padding: 12px 18px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .search:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--glow);
  }

  .month {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 28px 0 14px;
    color: var(--muted);
    font-size: 18px;
    font-weight: 500;
  }

  .month::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--line);
  }

  .none {
    margin: 40px 0;
    color: var(--muted);
    text-align: center;
  }
</style>
