<script>
  import { entries, replaceAll } from '../lib/entries.svelte.js';

  const LAST = 'thefacebook-last-backup';

  let input;
  let pending = $state.raw(null);
  let message = $state('');
  let failed = $state(false);
  let lastBackup = $state(localStorage.getItem(LAST));

  function say(text, isError = false) {
    message = text;
    failed = isError;
  }

  function exportBackup() {
    const payload = {
      format: 'thefacebook-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      posts: $state.snapshot(entries.list)
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `thefacebook-backup-${payload.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    lastBackup = payload.exportedAt;
    localStorage.setItem(LAST, lastBackup);
    say(`Exported ${payload.posts.length} entries.`);
  }

  async function pick() {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data?.format !== 'thefacebook-backup' || !Array.isArray(data.posts)) {
        throw new Error('This is not a valid thefacebook backup.');
      }
      pending = data.posts
        .filter((p) => p && ['id', 'title', 'body', 'date'].every((key) => typeof p[key] === 'string'))
        .map((p) => ({
          id: p.id,
          title: p.title,
          date: p.date,
          body: p.body,
          createdAt: Number(p.createdAt) || Date.now()
        }));
      say('');
    } catch (err) {
      pending = null;
      say(`Could not read the backup: ${err.message}`, true);
    }
  }

  async function restore(mode) {
    const incoming = pending;
    const list =
      mode === 'merge'
        ? [...new Map([...$state.snapshot(entries.list), ...incoming].map((p) => [p.id, p])).values()]
        : incoming;
    try {
      await replaceAll(list);
      pending = null;
      say(`Restored ${incoming.length} entries.`);
    } catch (err) {
      say(`Could not restore the backup: ${err.message}`, true);
    }
  }

  const lastLabel = $derived(
    lastBackup ? new Date(lastBackup).toLocaleDateString(undefined, { dateStyle: 'long' }) : null
  );
</script>

<section class="panel">
  <h2>Backup</h2>
  <p class="text">
    Save your entries as a JSON file, or restore a previous backup. Everything is kept in this browser unless you
    export it.
  </p>

  <p class="last" class:stale={!lastBackup}>
    {lastLabel ? `Last backup: ${lastLabel}.` : 'You have not exported a backup yet.'}
  </p>

  <div class="actions">
    <button class="btn primary" type="button" onclick={exportBackup}>Export backup</button>
    <button class="btn" type="button" onclick={() => input.click()}>Restore backup</button>
    <input bind:this={input} type="file" accept="application/json,.json" hidden onchange={pick} />
  </div>

  {#if pending}
    <div class="confirm">
      <p>
        <strong>{pending.length} {pending.length === 1 ? 'entry' : 'entries'}</strong> found. You have
        {entries.list.length} on this device.
      </p>
      <div class="actions">
        <button class="btn primary" type="button" onclick={() => restore('merge')}>Merge with current</button>
        <button class="btn" type="button" onclick={() => restore('replace')}>Replace all</button>
        <button class="btn ghost" type="button" onclick={() => (pending = null)}>Cancel</button>
      </div>
    </div>
  {:else}
    <p class="warning">Restoring can merge into your entries or replace everything stored on this device.</p>
  {/if}

  {#if message}
    <p class="message" class:failed>{message}</p>
  {/if}
</section>

<style>
  .text {
    margin: 0 0 12px;
    color: var(--muted);
    line-height: 1.6;
  }

  .last {
    margin: 0 0 20px;
    font-size: 13px;
    font-weight: 600;
  }

  .last.stale {
    color: var(--accent);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .warning {
    margin: 20px 0 0;
    color: var(--muted);
    font-size: 12px;
  }

  .confirm {
    margin-top: 20px;
    padding: 16px 18px;
    border: 1px solid var(--accent);
    border-radius: 14px;
    background: var(--bg);
    animation: rise 0.35s var(--ease) both;
  }

  .confirm p {
    margin: 0 0 12px;
  }

  .message {
    margin: 16px 0 0;
    font-size: 13px;
    font-weight: 600;
    animation: rise 0.35s var(--ease) both;
  }

  .message.failed {
    color: var(--danger);
  }

  @media (max-width: 600px) {
    .actions .btn {
      flex: 1;
    }
  }
</style>
