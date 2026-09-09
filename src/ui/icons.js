// Small inline SVG symbols keep interface icons crisp without a font or network request.
const paths = {
  leaf: '<path d="M19 4C9 2 3 7 6 15s13 4 13-11Z"/><path d="m5 21 9-12"/>',
  wood: '<path d="m12 2 7 9h-4l5 6H4l5-6H5Z"/><path d="M12 17v5"/>',
  stone: '<path d="m7 4 9 1 5 10-6 5H5L2 12Z"/><path d="m7 4 3 9 11 2M10 13l-5 7"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
  people:
    '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6M18 13a5 5 0 0 1 3 4v4"/>',
  box: '<path d="m3 7 9-4 9 4v12l-9 3-9-3ZM3 7l9 4 9-4M12 11v11M7 5l10 4"/>',
  tech: '<path d="M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  reset: '<path d="M4 10a8 8 0 1 1 0 5M4 3v7h7"/>',
  save: '<path d="M4 3h13l4 4v14H3V3ZM7 3v6h9V3M7 21v-8h10v8"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}
