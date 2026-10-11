const KEY = 'thefacebook-theme';
const COLORS = { dark: '#0a1020', light: '#f4efe5' };

export const theme = $state({ mode: document.documentElement.dataset.theme });

function apply() {
  document.documentElement.dataset.theme = theme.mode;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', COLORS[theme.mode]);
}

apply();

export function toggleTheme() {
  theme.mode = theme.mode === 'dark' ? 'light' : 'dark';
  localStorage.setItem(KEY, theme.mode);
  apply();
}
