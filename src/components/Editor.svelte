<script>
  import { onMount } from 'svelte';
  import { save } from '../lib/entries.svelte.js';
  import { todayISO, wordCount } from '../lib/stats.js';

  let { entry = null, ondone } = $props();

  const DRAFT = 'thefacebook-draft';
  const draft = entry ? null : JSON.parse(localStorage.getItem(DRAFT) ?? 'null');

  let title = $state(entry?.title ?? draft?.title ?? '');
  let date = $state(entry?.date ?? todayISO());
  let body = $state(entry?.body ?? draft?.body ?? '');
  let restored = $state(Boolean(draft));
  let saving = $state(false);
  let error = $state('');
  let form;
  let titleInput;

  const words = $derived(wordCount(body));

  onMount(() => titleInput.focus());

  $effect(() => {
    if (entry) return;
    if (title || body) localStorage.setItem(DRAFT, JSON.stringify({ title, body }));
    else localStorage.removeItem(DRAFT);
  });

  function discard() {
    title = '';
    body = '';
    restored = false;
  }

  function shortcut(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') form.requestSubmit();
  }

  async function submit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanBody) {
      error = 'Please enter a title and an entry.';
      return;
    }
    saving = true;
    error = '';
    try {
      await save({
        id: entry?.id ?? `post-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: cleanTitle,
        date,
        body: cleanBody,
        createdAt: entry?.createdAt ?? Date.now()
      });
      if (!entry) localStorage.removeItem(DRAFT);
      ondone();
    } catch (err) {
      error = `Could not save the entry: ${err.message}`;
      saving = false;
    }
  }
</script>

<form class="panel" bind:this={form} onsubmit={submit}>
  <h2>{entry ? 'Edit entry' : 'Publish an entry'}</h2>

  {#if restored}
    <p class="note">
      Draft restored.
      <button class="link" type="button" onclick={discard}>Discard</button>
    </p>
  {/if}

  <div class="field">
    <label for="title">Title</label>
    <input id="title" bind:this={titleInput} bind:value={title} maxlength="160" required autocomplete="off" />
  </div>

  <div class="field">
    <label for="date">Date</label>
    <input id="date" type="date" bind:value={date} required />
  </div>

  <div class="field">
    <label for="body">Entry</label>
    <textarea id="body" bind:value={body} maxlength="20000" required onkeydown={shortcut}></textarea>
    <p class="hint">
      <span>{words} {words === 1 ? 'word' : 'words'}</span>
      <span>Ctrl/⌘ + Enter to publish</span>
    </p>
  </div>

  <div class="actions">
    <button class="btn primary" type="submit" disabled={saving}>{entry ? 'Save changes' : 'Publish'}</button>
    {#if entry}
      <button class="btn" type="button" onclick={ondone}>Cancel</button>
    {/if}
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</form>

<style>
  .note {
    margin: -8px 0 18px;
    color: var(--muted);
    font-size: 13px;
  }

  .hint {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin: 6px 2px 0;
    color: var(--muted);
    font-size: 12px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .error {
    margin: 14px 0 0;
    color: var(--danger);
    font-size: 13px;
  }

  @media (max-width: 600px) {
    .actions .btn {
      flex: 1;
    }

    .hint span:last-child {
      display: none;
    }
  }
</style>
