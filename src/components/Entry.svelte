<script>
  import { wordCount, readMinutes, longDate } from '../lib/stats.js';
  import { shareEntry } from '../lib/share.js';

  let { entry, index, leaving, onedit, onremove } = $props();

  let expanded = $state(false);
  let confirming = $state(false);
  let sharing = $state(false);
  let shareError = $state('');

  async function share() {
    sharing = true;
    shareError = '';
    try {
      await shareEntry(entry);
    } catch (error) {
      shareError = `Could not share: ${error.message}`;
    } finally {
      sharing = false;
    }
  }

  const words = $derived(wordCount(entry.body));
  const long = $derived(entry.body.length > 480);
</script>

<article class="entry" class:leaving style="--i:{index}">
  <time datetime={entry.date}>{longDate(entry.date)}</time>
  <h3>{entry.title}</h3>
  <div class="body" class:clamped={long && !expanded}>{entry.body}</div>
  {#if long}
    <button class="link" type="button" onclick={() => (expanded = !expanded)}>
      {expanded ? 'Show less' : 'Read more'}
    </button>
  {/if}
  <footer>
    <span class="meta">{words} {words === 1 ? 'word' : 'words'} · {readMinutes(words)} min read</span>
    <span class="actions">
      {#if confirming}
        <span class="ask">Remove this entry?</span>
        <button class="btn danger" type="button" onclick={() => onremove(entry.id)}>Remove</button>
        <button class="btn ghost" type="button" onclick={() => (confirming = false)}>Keep</button>
      {:else}
        <button class="btn ghost" type="button" onclick={share} disabled={sharing}>{sharing ? 'Sharing…' : 'Share'}</button>
        <button class="btn ghost" type="button" onclick={() => onedit(entry)}>Edit</button>
        <button class="btn ghost" type="button" onclick={() => (confirming = true)}>Remove</button>
      {/if}
    </span>
  </footer>
  {#if shareError}
    <p class="share-error">{shareError}</p>
  {/if}
</article>

<style>
  .entry {
    position: relative;
    margin-bottom: 14px;
    padding: 24px 26px 16px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--surface);
    transition: border-color 0.3s, transform 0.3s var(--ease), background-color 0.4s;
    animation: rise 0.55s calc(var(--i) * 60ms) var(--ease) both;
  }

  .entry::before {
    content: '';
    position: absolute;
    top: 24px;
    bottom: 24px;
    left: 0;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--accent);
    transform: scaleY(0);
    transition: transform 0.4s var(--ease);
  }

  .entry:hover {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
  }

  .entry:hover::before {
    transform: scaleY(1);
  }

  .entry.leaving {
    animation: leave 0.26s ease-in forwards;
  }

  @keyframes leave {
    to {
      opacity: 0;
      transform: translateX(28px) scale(0.98);
    }
  }

  time {
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h3 {
    margin: 8px 0 12px;
    font-size: 27px;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .body {
    font-family: var(--font-display);
    font-size: 17px;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .body.clamped {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 6;
    line-clamp: 6;
    overflow: hidden;
  }

  .link {
    margin-top: 8px;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }

  .meta {
    color: var(--muted);
    font-size: 12px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .share-error {
    margin: 10px 0 0;
    color: var(--danger);
    font-size: 12px;
  }

  .ask {
    margin-right: 6px;
    color: var(--muted);
    font-size: 13px;
  }

  @media (max-width: 600px) {
    .entry {
      padding: 20px 18px 12px;
    }

    h3 {
      font-size: 23px;
    }
  }
</style>
