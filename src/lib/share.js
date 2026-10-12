import { longDate } from './stats.js';

const WIDTH = 1080;
const PAD = 96;
const MAX_BODY_LINES = 140;
const COLORS = { bg: '#0a1020', surface: '#111a2e', text: '#e9edf6', muted: '#8f9cb6', accent: '#ffb454' };
const DISPLAY = '"Fraunces Variable", Georgia, serif';
const UI = '"Bricolage Grotesque Variable", system-ui, sans-serif';

function wrap(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderEntryPng(entry) {
  await Promise.all([
    document.fonts.load(`600 64px ${DISPLAY}`),
    document.fonts.load(`400 34px ${DISPLAY}`),
    document.fonts.load(`600 22px ${UI}`)
  ]);

  const measure = document.createElement('canvas').getContext('2d');
  const textWidth = WIDTH - PAD * 2;

  measure.font = `600 64px ${DISPLAY}`;
  const titleLines = wrap(measure, entry.title, textWidth);
  const titleLine = 76;

  measure.font = `400 34px ${DISPLAY}`;
  let bodyLines = wrap(measure, entry.body, textWidth);
  const truncated = bodyLines.length > MAX_BODY_LINES;
  if (truncated) {
    bodyLines = bodyLines.slice(0, MAX_BODY_LINES);
    bodyLines[bodyLines.length - 1] = bodyLines[bodyLines.length - 1].replace(/\s*$/, '') + ' …';
  }
  const bodyLine = 52;

  const dateHeight = 40;
  const titleHeight = titleLines.length * titleLine;
  const bodyHeight = bodyLines.length * bodyLine;
  const footerHeight = 90;
  const height = Math.ceil(PAD + dateHeight + titleHeight + 40 + bodyHeight + 60 + footerHeight + PAD);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, height);

  const glow = ctx.createRadialGradient(WIDTH / 2, 0, 0, WIDTH / 2, 0, WIDTH * 0.7);
  glow.addColorStop(0, 'rgba(255, 180, 84, 0.16)');
  glow.addColorStop(1, 'rgba(255, 180, 84, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, height);

  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(PAD, PAD - 24, 64, 6);

  let y = PAD + 24;
  ctx.fillStyle = COLORS.accent;
  ctx.font = `600 22px ${UI}`;
  ctx.textBaseline = 'top';
  ctx.fillText(longDate(entry.date).toUpperCase(), PAD, y);
  y += dateHeight;

  ctx.fillStyle = COLORS.text;
  ctx.font = `600 64px ${DISPLAY}`;
  ctx.textBaseline = 'alphabetic';
  for (const line of titleLines) {
    y += titleLine;
    ctx.fillText(line, PAD, y - 18);
  }
  y += 40;

  ctx.fillStyle = COLORS.text;
  ctx.font = `400 34px ${DISPLAY}`;
  for (const line of bodyLines) {
    y += bodyLine;
    ctx.fillText(line, PAD, y - 14);
  }

  const footerY = height - PAD - footerHeight + 30;
  ctx.fillStyle = COLORS.surface;
  ctx.fillRect(PAD, footerY - 30, textWidth, 1);
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 22px ${UI}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('thefacebook · personal history', PAD, footerY + 6);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image.'))), 'image/png');
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export async function shareEntry(entry) {
  const blob = await renderEntryPng(entry);
  const name = `${entry.date}-${slugify(entry.title) || 'entry'}.png`;
  const file = new File([blob], name, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: entry.title });
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    }
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
