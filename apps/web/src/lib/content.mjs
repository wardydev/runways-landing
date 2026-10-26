import { contentData } from '../data/index.mjs';

const listKeys = ['services', 'service_packages', 'article_categories', 'articles', 'portfolios', 'gallery', 'faqs'];
const pricingNoteDefaults = { pricing_note_enabled: false, pricing_note_title: '', pricing_note_text: '' };

export function config(env = process.env) {
  const environment = env.SITE_ENV || 'local';
  if (!['local', 'staging', 'production'].includes(environment)) throw new Error('SITE_ENV tidak valid.');
  const siteUrl = new URL(env.SITE_URL || 'http://localhost:4321');
  if (!['http:', 'https:'].includes(siteUrl.protocol)) throw new Error('SITE_URL harus HTTP(S).');
  if (siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) throw new Error('SITE_URL harus berupa origin tanpa path atau credentials.');
  if (environment === 'production' && (siteUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(siteUrl.hostname))) throw new Error('Produksi memerlukan SITE_URL HTTPS publik.');
  return { environment, siteUrl: siteUrl.origin, ga4: /^G-[A-Z0-9]+$/.test(env.PUBLIC_GA4_ID || '') ? env.PUBLIC_GA4_ID : '' };
}

export function prepareContent(source, env = process.env, now = new Date()) {
  const cfg = config(env);
  const data = structuredClone(source);
  for (const singleton of ['site_settings', 'home_content']) {
    if (!data[singleton] || typeof data[singleton] !== 'object' || Array.isArray(data[singleton])) throw new Error(`Konten wajib tidak tersedia: ${singleton}.`);
  }
  for (const [field, fallback] of Object.entries(pricingNoteDefaults)) {
    data.home_content[field] ??= fallback;
    if (typeof data.home_content[field] !== typeof fallback) throw new Error(`home_content.${field}: tipe nilai tidak valid.`);
  }
  for (const name of listKeys) {
    if (!Array.isArray(data[name])) throw new Error(`Collection tidak valid: ${name}.`);
    const ids = new Set();
    for (const item of data[name]) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id)) throw new Error(`${name}: id wajib unik dan berupa teks.`);
      ids.add(item.id);
      if (name !== 'article_categories' && !['draft', 'review', 'published', 'archived'].includes(item.status)) throw new Error(`${name}: status harus draft, review, published, atau archived.`);
      if (name === 'articles' && item.status === 'published' && (!item.published_at || !Number.isFinite(Date.parse(item.published_at)))) throw new Error('articles: published_at wajib berupa tanggal valid.');
    }
    data[name] = data[name].filter((item) => !('status' in item) || item.status === 'published').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }
  data.portfolios = data.portfolios.filter((item) => item.consent_to_publish === true);
  data.articles = data.articles.filter((item) => item.published_at && Number.isFinite(Date.parse(item.published_at)) && Date.parse(item.published_at) <= now.getTime()).sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  const categoryIds = new Set(data.article_categories.map((item) => item.id));
  for (const article of data.articles) if (!categoryIds.has(article.category_id)) throw new Error('articles: category_id tidak ditemukan di article-categories.json.');
  const serviceIds = new Set(data.services.map((item) => item.id));
  data.service_packages = data.service_packages.filter((item) => serviceIds.has(item.service_id));
  data.faqs = data.faqs.filter((item) => !item.service_id || serviceIds.has(item.service_id));

  const required = (item, fields, context) => {
    for (const field of fields) if (typeof item[field] !== 'string' || !item[field].trim()) throw new Error(`${context}: field ${field} wajib diisi.`);
  };
  required(data.site_settings, ['brand_name', 'default_seo_title', 'default_seo_description'], 'site_settings');
  required(data.home_content, ['hero_label', 'hero_title', 'hero_description', 'benefits_title', 'benefits_description', 'pricing_title', 'pricing_description', 'services_title', 'services_description', 'process_title', 'portfolio_title', 'gallery_title', 'articles_title', 'closing_headline', 'closing_description', 'offer_label'], 'home_content');
  for (const name of ['services', 'articles', 'portfolios', 'article_categories']) {
    const slugs = new Set();
    for (const item of data[name]) {
      required(item, ['slug', ...(name === 'article_categories' ? ['name'] : ['seo_title', 'seo_description', 'body', name === 'services' ? 'name' : 'title', name === 'services' ? 'short_description' : name === 'articles' ? 'excerpt' : 'summary'])], name);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || slugs.has(item.slug)) throw new Error(`Slug tidak valid atau duplikat: ${name}/${item.slug}.`);
      slugs.add(item.slug);
    }
  }
  for (const item of data.service_packages) {
    required(item, ['name', 'description', 'disclaimer', 'estimated_duration_text'], 'service_packages');
    if (item.price === null || item.price === '' || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) throw new Error('Harga paket harus angka non-negatif.');
    if (item.compare_at_price != null && (!Number.isFinite(Number(item.compare_at_price)) || Number(item.compare_at_price) <= Number(item.price))) throw new Error('Harga pembanding harus lebih besar dari harga paket.');
    if (!Array.isArray(item.deliverables) || !item.deliverables.length || item.deliverables.some((value) => typeof value !== 'string' || !value.trim())) throw new Error('Cakupan paket wajib berupa daftar teks.');
  }
  for (const field of ['benefits', 'process_steps']) {
    if (!Array.isArray(data.home_content[field]) || data.home_content[field].some((item) => typeof item.title !== 'string' || typeof item.description !== 'string')) throw new Error(`home_content.${field} harus berupa daftar judul dan deskripsi.`);
  }
  for (const item of data.gallery) required(item, ['title', 'alt_text'], 'gallery');
  for (const item of data.articles) {
    required(item, ['author_name', 'image_alt'], 'articles');
    if (item.updated_at && !Number.isFinite(Date.parse(item.updated_at))) throw new Error('Tanggal pembaruan artikel tidak valid.');
  }
  const hasPlaceholders = data.site_settings.placeholder_mode || Object.values(data).some((items) => Array.isArray(items) && items.some((item) => item.is_demo));
  if (cfg.environment === 'production' && hasPlaceholders) throw new Error('Konten placeholder belum boleh dipublikasikan ke produksi.');
  return { ...data, _meta: { environment: cfg.environment, siteUrl: cfg.siteUrl, ga4: cfg.ga4, noindex: cfg.environment !== 'production', placeholders: Boolean(hasPlaceholders) } };
}

// JSON is imported at build time and tracked by Astro/Vite during development.
// No network, credentials, database, or background content service is required.
export async function loadContent(env = process.env) {
  return prepareContent(contentData, env);
}
