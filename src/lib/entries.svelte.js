import * as db from './db.js';

export const entries = $state({ list: [], loaded: false });

function newestFirst(a, b) {
  if (a.date === b.date) return (b.createdAt || 0) - (a.createdAt || 0);
  return b.date.localeCompare(a.date);
}

export async function load() {
  entries.list = (await db.getAll()).sort(newestFirst);
  entries.loaded = true;
}

export async function save(entry) {
  await db.save(entry);
  await load();
}

export async function remove(id) {
  await db.remove(id);
  await load();
}

export async function replaceAll(list) {
  await db.replaceAll(list);
  await load();
}
