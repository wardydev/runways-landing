import { e, lines, richText, image, icon, jsonLd, dateLabel, safeUrl } from './html.mjs';
import { homePage } from '../components/home.mjs';
import { header, footer, lightbox, sectionTitle, serviceCard, pricingNote, pricingCard, articleCard, portfolioCard, galleryGrid, closingCta, contactButton } from '../components/common.mjs';

const PAGE_SIZE = 6;
export function getRoutes(data) {
  const routes = [
    { path: '/', type: 'home', title: data.site_settings.default_seo_title, description: data.site_settings.default_seo_description },
    { path: '/layanan/', type: 'services', title: 'Pilihan Layanan untuk Kebutuhan Usaha', description: 'Kenali ruang lingkup pendampingan persiapan pendirian, administrasi, dan pembaruan data usaha.' },
    { path: '/portfolio/', type: 'portfolios', title: 'Portfolio dan Studi Kasus', description: 'Kenali studi kasus pendampingan usaha yang telah mendapat persetujuan publikasi.' },
    { path: '/galeri/', type: 'gallery', title: 'Galeri Aktivitas dan Dokumentasi', description: 'Lihat dokumentasi dan ilustrasi ruang diskusi serta kolaborasi usaha.' },
    { path: '/tentang-kami/', type: 'about', title: 'Tentang Kami', description: 'Kenali pendekatan pendampingan dan cara membahas kebutuhan usaha bersama kami.' },
    { path: '/kebijakan-privasi/', type: 'privacy', title: 'Kebijakan Privasi', description: 'Informasi mengenai tautan WhatsApp, pengukuran kunjungan, dan penggunaan data pada website.' },
  ];
  for (const [collection, prefix, type] of [['services', 'layanan', 'service'], ['articles', 'artikel', 'article'], ['portfolios', 'portfolio', 'portfolio']]) {
    for (const item of data[collection]) routes.push({ path: `/${prefix}/${item.slug}/`, type, item, title: item.seo_title, description: item.seo_description, noindex: Boolean(item.noindex), image: item.image_url });
  }
  const articleListing = (items, base, category = null) => {
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    for (let page = 1; page <= pages; page++) routes.push({ path: page === 1 ? base : `${base}halaman/${page}/`, base, type: 'articles', category, page, pages, items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), title: `${category ? `Artikel ${category.name}` : 'Artikel dan Wawasan Usaha'}${page > 1 ? ` — Halaman ${page}` : ''}`, description: `Bahan bacaan ${category ? `tentang ${category.name.toLowerCase()}` : 'untuk menyiapkan langkah usaha'} dan pembahasan kebutuhan administrasi.` });
  };
  articleListing(data.articles, '/artikel/');
  for (const category of data.article_categories) articleListing(data.articles.filter((item) => item.category_id === category.id), `/artikel/kategori/${category.slug}/`, category);
  return routes;
}

export const notFoundRoute = { path: '/404/', type: '404', title: 'Halaman Tidak Ditemukan', description: 'Halaman yang Anda cari tidak tersedia. Kembali ke beranda atau jelajahi layanan.', noindex: true };

function pageHero(route, eyebrow = 'Kenali lebih dekat') {
  return `<section class="page-hero"><div class="container"><nav aria-label="Breadcrumb" class="breadcrumbs"><ol><li><a href="/">Beranda</a></li><li aria-current="page">${e(route.title)}</li></ol></nav>${sectionTitle(eyebrow, route.title, route.description, 'center', 'h1')}</div></section>`;
}

function pagination(route) {
  if (route.pages <= 1) return '';
  return `<nav class="pagination" aria-label="Halaman artikel">${Array.from({ length: route.pages }, (_, index) => { const page = index + 1; return `<a href="${page === 1 ? route.base : `${route.base}halaman/${page}/`}" ${page === route.page ? 'aria-current="page"' : ''} aria-label="Halaman ${page}">${page}</a>`; }).join('')}</nav>`;
}

function detailPage(route, data) {
  const item = route.item;
  const isArticle = route.type === 'article';
  const parent = isArticle ? ['Artikel', '/artikel/'] : route.type === 'service' ? ['Layanan', '/layanan/'] : ['Portfolio', '/portfolio/'];
  const faqs = data.faqs.filter((faq) => !faq.service_id || faq.service_id === item.id);
  const packages = data.service_packages.filter((entry) => entry.service_id === item.id);
  const related = data.articles.filter((entry) => entry.id !== item.id).slice(0, 2);
  return `<section class="detail-intro"><div class="container"><nav aria-label="Breadcrumb" class="breadcrumbs"><ol><li><a href="/">Beranda</a></li><li><a href="${parent[1]}">${parent[0]}</a></li><li aria-current="page">${e(item.title || item.name)}</li></ol></nav><div class="detail-heading"><span class="eyebrow">${e(item.category || parent[0])}${item.is_demo ? ' • Konten contoh' : ''}</span><h1>${e(item.title || item.name)}</h1><p>${e(item.excerpt || item.short_description || item.summary)}</p>${isArticle ? `<p class="article-byline">${e(item.author_name)} <span>•</span> <time datetime="${e(item.published_at)}">${e(dateLabel(item.published_at))}</time>${item.updated_at ? ` <span>•</span> Diperbarui ${e(dateLabel(item.updated_at))}` : ''}</p>` : ''}</div></div></section><section class="detail-section"><div class="container detail-layout"><article class="detail-main">${image(item.image_url, item.image_alt || `Ilustrasi ${item.title || item.name}`, 'detail-cover', { eager: true, width: 1000, height: 600 })}${item.is_demo ? '<p class="inline-note">Materi ini merupakan contoh untuk prototipe. Informasi layanan dan materi editorial final masih menunggu review.</p>' : ''}<div class="prose">${richText(item.body)}</div>${!isArticle && faqs.length ? `<div class="faq-list"><h2>Pertanyaan yang sering diajukan</h2>${faqs.map((faq) => `<details><summary>${e(faq.question)}</summary><p>${e(faq.answer)}</p></details>`).join('')}</div>` : ''}</article><aside class="detail-sidebar"><span class="eyebrow">Langkah berikutnya</span><h2>Mari bahas kebutuhan Anda.</h2><p>Pahami pilihan dan ruang lingkup pendampingan sebelum mengambil keputusan.</p>${contactButton(data, { placement: 'detail', service: item.name || '', fallback: '/#paket', fallbackLabel: 'Lihat pilihan paket' })}<hr><h3>Jelajahi layanan</h3>${data.services.map((service) => `<a href="/layanan/${e(service.slug)}/">${e(service.name)}${icon('arrow')}</a>`).join('')}</aside></div></section>${packages.length ? `<section class="pricing-section section-space"><div class="container">${sectionTitle('Pilihan pendampingan', `Paket ${item.name}`, 'Tinjau cakupan dan ketentuan setiap paket.')}${pricingNote(data.home_content)}<div class="pricing-grid">${packages.map((entry) => pricingCard(entry, data)).join('')}</div></div></section>` : ''}${isArticle && related.length ? `<section class="section-space"><div class="container">${sectionTitle('Lanjutkan membaca', 'Wawasan berikutnya.')}<div class="articles-grid">${related.map((entry) => articleCard(entry, data)).join('')}</div></div></section>` : ''}${closingCta(data)}`;
}

function privacy(data) {
  return `<section class="section-space"><div class="container prose narrow"><p class="inline-note">${data._meta.placeholders ? 'Draft kebijakan untuk prototipe. Identitas pengelola, praktik pemrosesan, dan kontak akan dilengkapi sebelum rilis.' : 'Kebijakan ini menjelaskan fungsi pengukuran dasar pada website. Hubungi pengelola untuk pertanyaan terkait data.'}</p><h2>Pengelola website</h2><p>${e(data.site_settings.brand_name)} mengelola informasi layanan pada website ini. ${data.site_settings.email ? `Kontak: ${e(data.site_settings.email)}.` : 'Alamat kontak pengelola sedang disiapkan.'}</p><h2>Kontak melalui WhatsApp</h2><p>Tombol WhatsApp membuka layanan pihak ketiga dengan pesan awal sesuai layanan atau paket. Website tidak menyimpan isi percakapan konsultasi. Pemrosesan percakapan selanjutnya mengikuti praktik pengelola dan kebijakan WhatsApp.</p><h2>Pengukuran kunjungan</h2><p>Pengukuran analytics opsional hanya diaktifkan setelah Anda memilih Setujui pada pemberitahuan privasi. Event klik WhatsApp berisi jalur halaman, posisi tombol, serta nama layanan atau paket. Isi pesan dan nomor telepon pengunjung tidak dikirim sebagai parameter event.</p><h2>Pilihan Anda</h2><p>Pilihan analytics disimpan di browser agar tidak ditanyakan pada setiap kunjungan. Anda dapat mengubahnya melalui tombol berikut.</p><button class="button button-outline" type="button" data-reset-consent>Ubah pilihan analytics</button><h2>Aset pihak ketiga</h2><p>Font dapat dimuat melalui Google Fonts. Permintaan font mengikuti kebijakan layanan tersebut. Gambar website disajikan dari folder aset website.</p><h2>Data pribadi</h2><p>Website ini tidak menyediakan formulir unggah dokumen atau akun pelanggan. Hindari mengirim dokumen sensitif sebelum memahami tujuan dan pihak penerimanya.</p></div></section>`;
}

export function renderBody(data, route) {
  switch (route.type) {
    case 'home': return homePage(data);
    case 'service': case 'article': case 'portfolio': return detailPage(route, data);
    case 'services': return `${pageHero(route, 'Ruang lingkup pendampingan')}<section class="section-space"><div class="container services-grid">${data.services.map(serviceCard).join('') || '<p class="empty-state">Layanan sedang disiapkan.</p>'}</div></section>${closingCta(data)}`;
    case 'articles': return `${pageHero(route, 'Bekal langkah usaha')}<section class="section-space"><div class="container"><nav class="filter-tabs" aria-label="Kategori artikel"><a href="/artikel/" ${!route.category ? 'aria-current="page"' : ''}>Semua artikel</a>${data.article_categories.map((category) => `<a href="/artikel/kategori/${e(category.slug)}/" ${category.id === route.category?.id ? 'aria-current="page"' : ''}>${e(category.name)}</a>`).join('')}</nav><div class="articles-grid">${route.items.map((item) => articleCard(item, data)).join('') || '<p class="empty-state">Belum ada artikel pada kategori ini.</p>'}</div>${pagination(route)}</div></section>${closingCta(data)}`;
    case 'portfolios': return `${pageHero(route, 'Cerita pendampingan')}<section class="section-space"><div class="container portfolio-grid">${data.portfolios.length ? data.portfolios.map((item) => portfolioCard(item)).join('') : '<div class="empty-state"><span class="eyebrow">Sedang disiapkan</span><h2>Setiap cerita memerlukan persetujuan.</h2><p>Portfolio akan ditampilkan setelah mendapat izin publikasi. Ilustrasi format studi kasus dapat dilihat di beranda selama tahap pratinjau.</p><a class="text-link" href="/#portfolio">Lihat ilustrasi di beranda →</a></div>'}</div></section>${closingCta(data)}`;
    case 'gallery': { const categories = [...new Set(data.gallery.map((item) => item.category).filter(Boolean))]; return `${pageHero(route, 'Dokumentasi & ilustrasi')}<section class="section-space"><div class="container">${categories.length ? `<div class="filter-tabs" role="group" aria-label="Filter kategori galeri"><button type="button" data-gallery-filter="all" aria-pressed="true">Semua</button>${categories.map((category) => `<button type="button" data-gallery-filter="${e(category)}" aria-pressed="false">${e(category)}</button>`).join('')}</div>` : ''}${data._meta.placeholders ? '<p class="inline-note">Seluruh visual adalah ilustrasi dari aset template, bukan dokumentasi kegiatan bisnis nyata.</p>' : ''}${galleryGrid(data.gallery)}<p class="filter-result sr-only" aria-live="polite"></p>${!data.gallery.length ? '<p class="empty-state">Dokumentasi sedang disiapkan.</p>' : ''}</div></section>`; }
    case 'about': return `${pageHero(route, 'Tentang pendekatan kami')}<section class="section-space"><div class="container about-page"><div class="about-visual">${image(data.home_content.benefits_image, 'Ilustrasi diskusi kebutuhan dari aset template', '', { width: 460, height: 460 })}</div><div class="prose"><h2>${lines(data.home_content.benefits_title)}</h2><p>${e(data.home_content.benefits_description)}</p>${data.home_content.benefits.map((item) => `<h3>${e(item.title)}</h3><p>${e(item.description)}</p>`).join('')}${data._meta.placeholders ? '<p class="inline-note">Profil, identitas perusahaan, wilayah layanan, dan informasi tim belum diisi. Teks dan gambar ini adalah placeholder.</p>' : ''}</div></div></section>${closingCta(data)}`;
    case 'privacy': return `${pageHero(route, 'Informasi penggunaan data')}${privacy(data)}`;
    default: return `${pageHero(notFoundRoute, '404')}<section class="section-space"><div class="container empty-state"><h2>Mari kembali ke langkah awal.</h2><p>Tautan mungkin sudah berubah atau halaman belum tersedia.</p><a class="button button-primary" href="/">Kembali ke beranda ${icon('arrow')}</a></div></section>`;
  }
}

export function structuredData(data, route) {
  if (data._meta.placeholders || data._meta.noindex || route.noindex) return '';
  const base = data._meta.siteUrl;
  const entries = [{ '@type': 'Organization', '@id': `${base}/#organization`, name: data.site_settings.brand_name, url: base }];
  if (route.type !== 'home') entries.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Beranda', item: `${base}/` }, { '@type': 'ListItem', position: 2, name: route.title, item: `${base}${route.path}` }] });
  if (route.type === 'article') entries.push({ '@type': 'Article', headline: route.item.title, description: route.description, datePublished: route.item.published_at, dateModified: route.item.updated_at || route.item.published_at, author: { '@type': 'Person', name: route.item.author_name }, mainEntityOfPage: `${base}${route.path}`, ...(safeUrl(route.item.image_url) ? { image: new URL(safeUrl(route.item.image_url), base).href } : {}) });
  if (route.type === 'service') entries.push({ '@type': 'Service', name: route.item.name, description: route.item.short_description, provider: { '@id': `${base}/#organization` } });
  return `<script type="application/ld+json">${jsonLd({ '@context': 'https://schema.org', '@graph': entries })}</script>`;
}

export function renderHead(data, route) {
  const title = `${route.title} | ${data.site_settings.brand_name}`;
  const canonical = new URL(route.path, data._meta.siteUrl).href;
  const cover = new URL(safeUrl(route.image, '/assets/images/about-img1.png'), data._meta.siteUrl).href;
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#C60E08"><title>${e(title)}</title><meta name="description" content="${e(route.description)}"><meta name="robots" content="${data._meta.noindex || route.noindex ? 'noindex, nofollow' : 'index, follow'}"><link rel="canonical" href="${e(canonical)}"><meta property="og:locale" content="id_ID"><meta property="og:type" content="${route.type === 'article' ? 'article' : 'website'}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(route.description)}"><meta property="og:url" content="${e(canonical)}"><meta property="og:image" content="${e(cover)}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${e(safeUrl(data.site_settings.logo_url, '/assets/images/logo.png'))}"><link rel="stylesheet" href="/assets/css/bootstrap.min.css"><link rel="stylesheet" href="/assets/css/template.css"><link rel="stylesheet" href="/assets/css/site.css">${structuredData(data, route)}`;
}

export function renderPageContent(data, route) {
  return `<a class="skip-link" href="#main">Lewati ke konten utama</a>${header(data, route.path)}<main id="main" tabindex="-1">${renderBody(data, route)}</main>${footer(data)}${lightbox}${data._meta.ga4 && data._meta.environment === 'production' ? `<section class="consent-banner" aria-label="Pilihan analytics" data-analytics="${e(data._meta.ga4)}" hidden><p>Izinkan analytics untuk membantu memahami penggunaan website? <a href="/kebijakan-privasi/">Baca kebijakan privasi</a>.</p><div><button type="button" class="button button-small button-outline" data-consent="denied">Tolak</button><button type="button" class="button button-small button-primary" data-consent="granted">Setujui</button></div></section>` : ''}<script src="/site.js" defer></script>`;
}

export function renderDocument(data, route) {
  return `<!doctype html><html lang="id"><head>${renderHead(data, route)}</head><body id="top">${renderPageContent(data, route)}</body></html>`;
}

export function sitemap(data) {
  const routes = data._meta.noindex ? [] : getRoutes(data).filter((route) => !route.noindex);
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${e(`${data._meta.siteUrl}${route.path}`)}</loc></url>`).join('')}</urlset>`;
}
export function robots(data) {
  return data._meta.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${data._meta.siteUrl}/sitemap.xml\n`;
}
