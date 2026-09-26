/* Elite Ballers FC — shared theme engine */
(function () {
  const KEY = 'eb-theme';
  const valid = ['system', 'light', 'dark'];
  function stored() {
    const value = localStorage.getItem(KEY);
    return valid.includes(value) ? value : 'system';
  }
  function systemDark() { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function apply(mode, persist = true) {
    mode = valid.includes(mode) ? mode : 'system';
    if (persist) localStorage.setItem(KEY, mode);
    const dark = mode === 'dark' || (mode === 'system' && systemDark());
    const html = document.documentElement;
    html.dataset.ebTheme = mode;
    html.classList.toggle('eb-dark', dark);
    html.classList.toggle('eb-light', !dark);
    document.querySelectorAll('[data-theme-choice]').forEach(el => {
      el.classList.toggle('active', el.dataset.themeChoice === mode);
      el.setAttribute('aria-pressed', el.dataset.themeChoice === mode ? 'true' : 'false');
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      el.textContent = dark ? '☀' : '☾';
      el.title = dark ? 'Switch theme' : 'Switch theme';
      el.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    });
    return mode;
  }
  function init() {
    apply(stored(), false);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener?.('change', () => { if (stored() === 'system') apply('system', false); });
  }
  window.EBTheme = { KEY, stored, apply, init, isDark: () => document.documentElement.classList.contains('eb-dark') };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
