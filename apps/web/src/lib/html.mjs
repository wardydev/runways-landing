export const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const e = escapeHtml;
export const lines = (value) => e(value).replace(/\n/g, '<br>');
export const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
export const dateLabel = (value) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' }).format(new Date(value));

export function safeUrl(value, fallback = '') {
  if (typeof value !== 'string' || /[\x00-\x20\\]/.test(value)) return fallback;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : fallback; } catch { return fallback; }
}

// Only bare presentation tags are retained. All attributes, scripts, links and
// unknown tags become text. Article content can never supply executable markup.
export function richText(value = '') {
  return String(value).split(/(<\/?[a-z][^>]*>)/gi).map((part) => /^<\/?(?:p|h2|h3|h4|ul|ol|li|strong|b|em|i|blockquote|br)\s*\/?\s*>$/i.test(part) ? part : e(part)).join('');
}

export function whatsappUrl(number, message) {
  if (typeof number !== 'string' || !/^\+[1-9]\d{7,14}$/.test(number.trim())) return null;
  return `https://wa.me/${number.trim().slice(1)}?text=${encodeURIComponent(message)}`;
}

export function image(src, alt = '', className = '', { eager = false, width = 640, height = 480 } = {}) {
  const url = safeUrl(src, '/assets/images/about-img1.png');
  return `<img src="${e(url)}" alt="${e(alt)}" class="${e(className)}" width="${width}" height="${height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${eager ? 'fetchpriority="high"' : ''}>`;
}

export const icons = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  down: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  document: '<path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6"/>',
  steps: '<path d="M3 20h6v-6h6V8h6V3M3 8l4-4 4 4M7 4v10"/>',
  chat: '<path d="M20 11a8 8 0 0 1-8 8H5l-4 3 2-7a8 8 0 1 1 17-4Z"/><path d="M7 10h9m-9 4h6"/>',
  building: '<path d="M4 21V5l8-3 8 3v16M2 21h20M8 7h1m6 0h1m-8 4h1m6 0h1m-6 10v-6h4v6"/>',
  refresh: '<path d="M20 7V3m0 4h-4M4 17v4m0-4h4M5 8a8 8 0 0 1 14-3M5 19a8 8 0 0 0 14-3"/>',
  whatsapp: '<path d="M20 11a8 8 0 0 1-8 8 9 9 0 0 1-4-1l-5 2 1-5a8 8 0 1 1 16-4Z"/><path d="M8 7c0 5 3 8 7 8l1-2-3-1-1 1-2-2 1-1-1-3Z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
};
export const icon = (name, className = '') => `<svg class="icon ${e(className)}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.document}</svg>`;
export const star = '<svg class="star" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><path d="m22 0 4.1 14 13-6.5-6.5 13L44 22l-14 4.1 6.5 13-13-6.5L22 44l-4.1-14-13 6.5 6.5-13L0 22l14-4.1L7.5 5l13 6.5Z" fill="currentColor"/></svg>';
