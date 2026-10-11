# thefacebook

A simple, private personal history. Write dated entries, search them, and keep everything on your own device. Installable as a PWA and fully usable offline.

## Features

- Write, edit and remove dated entries (up to 20,000 characters each)
- Entries grouped by month, with search, word counts and reading time
- Writing stats: entries, total words and current day streak
- Draft autosave: an unpublished entry survives a refresh or a closed tab
- Backup as JSON, with a choice to merge into or replace current entries on restore
- Light and dark themes (follows your system on first visit)
- Installable PWA with an offline app shell and a "New entry" home-screen shortcut
- Requests persistent storage so the browser is less likely to evict your data

## Stack

Svelte 5 · Vite · vite-plugin-pwa · IndexedDB · Fraunces and Bricolage Grotesque (self-hosted via Fontsource)

## Run locally

```bash
npm install
npm run dev
```

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New… → Project** and import the repository.
3. Keep the detected **Vite** preset (build command `npm run build`, output directory `dist`) and deploy.

## Your data

Entries live in your browser's IndexedDB (`thefacebook-local-v2`), the same database the previous vanilla version used. If you deploy this on the same origin as the old app, your existing entries appear automatically. On a different domain or device, use **Backup → Export** on the old app and **Restore** here.

## Project structure

```
src/
  App.svelte            shell, tabs, theme toggle
  app.css               design tokens, shared styles
  components/           History, Entry, Editor, Backup
  lib/                  db.js (IndexedDB), entries, theme, stats
public/icons/           app icons
```
