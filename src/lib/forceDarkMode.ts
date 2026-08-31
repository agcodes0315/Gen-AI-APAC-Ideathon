/**
 * MirrorTrace dark-only theme lock.
 *
 * Import this module once from the application entry point:
 *
 *   import './lib/forceDarkMode.ts';
 *
 * It deliberately does not alter the public AuthView layout.
 * It only prevents an old saved "light" preference or a theme
 * toggle from switching the document away from dark mode.
 */

const DARK_THEME_VALUE = 'dark';

function applyDarkMode(): void {
  const root = document.documentElement;

  root.setAttribute('data-theme', DARK_THEME_VALUE);
  root.style.colorScheme = DARK_THEME_VALUE;

  try {
    localStorage.setItem('mirrortrace-theme', DARK_THEME_VALUE);
    localStorage.setItem('theme', DARK_THEME_VALUE);
  } catch {
    // Storage may be unavailable in privacy-restricted contexts.
  }
}

applyDarkMode();

/*
 * Keep dark mode authoritative even if an older theme toggle
 * or component tries to change data-theme after initial load.
 */
const observer = new MutationObserver(() => {
  const root = document.documentElement;

  if (root.getAttribute('data-theme') !== DARK_THEME_VALUE) {
    applyDarkMode();
  }
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

export { applyDarkMode };
