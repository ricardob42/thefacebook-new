const DAY = 86400000;

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function wordCount(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function readMinutes(words) {
  return Math.max(1, Math.round(words / 200));
}

function dayNumber(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
}

export function streak(list) {
  const days = [...new Set(list.map((e) => dayNumber(e.date)))].sort((a, b) => b - a);
  if (!days.length) return 0;
  const now = new Date();
  const today = Math.round(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY);
  if (days[0] < today - 1) return 0;
  let run = 1;
  while (run < days.length && days[run - 1] - days[run] === 1) run++;
  return run;
}

export function streakTier(days) {
  if (days >= 200) return 5;
  if (days >= 100) return 4;
  if (days >= 30) return 3;
  if (days >= 10) return 2;
  return days > 0 ? 1 : 0;
}

export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
