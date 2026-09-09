// Shared display formatting; rounding here never changes simulation balances.
export const number = (value) =>
  value < 100 ? value.toFixed(2) : Math.floor(value).toLocaleString('en-US');
export const signed = (value) => `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}`;
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
