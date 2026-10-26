import { e, lines, icon, star, image, safeUrl, money, dateLabel, whatsappUrl } from '../lib/html.mjs';

export function brand(settings, { eager = false } = {}) {
  const name = settings.brand_name === 'Nama Brand' ? 'Runways' : settings.brand_name;
  return `<a class="brand" href="/" aria-label="${e(name)} — Beranda">${image(settings.logo_url || '/assets/images/logo.png', `Logo ${name}`, 'brand-logo', { eager, width: 174, height: 174 })}</a>`;
}

export function contactButton(data, { label = 'Konsultasi WhatsApp', placement = 'general', service = '', packageName = '', message = '', className = 'button button-primary', fallback = '/#paket', fallbackLabel = 'Lihat pilihan paket' } = {}) {
  if (className.split(' ').includes('button-primary')) className += ' tax-services';
  const url = whatsappUrl(data.site_settings.whatsapp_number, message || `Halo, saya ingin berkonsultasi${service ? ` mengenai ${service}` : ' tentang kebutuhan usaha saya'}${packageName ? `, paket ${packageName}` : ''}.`);
  return url ? `<a class="${e(className)}" href="${e(url)}" target="_blank" rel="noopener noreferrer" data-wa data-placement="${e(placement)}" data-service="${e(service)}" data-package="${e(packageName)}">${icon('whatsapp')}${e(label)}${icon('arrow')}</a>` : `<a class="${e(className)}" href="${e(safeUrl(fallback, '/layanan/'))}">${e(fallbackLabel)}${icon('arrow')}</a>`;
}

export function header(data, currentPath = '/') {
  const nav = [['Beranda', '/'], ['Layanan', '/layanan/'], ['Paket', '/#paket'], ['Portfolio', '/portfolio/'], ['Galeri', '/galeri/'], ['Artikel', '/artikel/']];
  return `<header class="site-header"><div class="container header-inner">${brand(data.site_settings, { eager: true })}
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Buka menu navigasi">${icon('menu')}<span>Menu</span></button>
    <nav id="main-nav" class="main-nav" aria-label="Navigasi utama">${nav.map(([title, href]) => `<a href="${href}" ${currentPath === href || (href !== '/' && !href.includes('#') && currentPath.startsWith(href)) ? 'aria-current="page"' : ''}>${title}</a>`).join('')}<a href="/tentang-kami/" class="mobile-about">Tentang Kami</a></nav>
    <div class="header-action">${contactButton(data, { label: 'Mari diskusi', placement: 'header', className: 'button button-small', fallback: '/#konsultasi', fallbackLabel: 'Mari diskusi' })}</div>
  </div></header>`;
}

export function sectionTitle(label, title, description = '', align = 'center', tag = 'h2') {
  const heading = tag === 'h1' ? 'h1' : 'h2';
  return `<div class="section-heading ${align === 'left' ? 'heading-left' : ''}"><span class="eyebrow"><span class="eyebrow-line"></span>${e(label)}</span><${heading}>${lines(title)}<span class="heading-star">${star}</span></${heading}>${description ? `<p>${e(description)}</p>` : ''}</div>`;
}

export function serviceCard(item) {
  return `<article class="service2-boxarea"><span class="service-icon services-icon">${icon(item.icon)}</span><span class="card-number">0${Number(item.sort) || 1}</span><h3><a href="/layanan/${e(item.slug)}/">${e(item.name)}</a></h3><p>${e(item.short_description)}</p><a class="text-link" href="/layanan/${e(item.slug)}/">Pelajari layanan ${icon('arrow')}</a></article>`;
}

export function pricingNote(home) {
  if (!home.pricing_note_enabled || !home.pricing_note_text.trim()) return '';
  return `<p class="pricing-note">${home.pricing_note_title.trim() ? `<span>${e(home.pricing_note_title)}</span> ` : ''}${lines(home.pricing_note_text)}</p>`;
}

export function pricingCard(item, data) {
  const service = data.services.find((entry) => entry.id === item.service_id);
  return `<article class="pricing-card ${item.featured ? 'pricing-featured' : ''}">${item.featured ? '<span class="featured-label">Pilihan unggulan</span>' : ''}<span class="package-service">${e(service?.name)}</span><h3>${e(item.name)}</h3><p class="package-description">${e(item.description)}</p><div class="price">${item.compare_at_price ? `<del>${e(money(item.compare_at_price))}</del>` : ''}<span>${item.is_demo ? 'Harga contoh' : 'Mulai dari'}</span><strong>${e(money(item.price))}</strong><small>per paket layanan</small></div><ul class="package-features">${item.deliverables.map((text) => `<li>${icon('check')}<span>${e(text)}</span></li>`).join('')}</ul><div class="package-bottom"><p class="duration">${icon('steps')}${e(item.estimated_duration_text)}</p>${contactButton(data, { label: 'Diskusikan paket', placement: 'pricing', service: service?.name, packageName: item.name, message: item.message_template, className: `button ${item.featured ? 'button-primary' : 'button-outline'}`, fallback: `/layanan/${service?.slug}/`, fallbackLabel: 'Lihat detail layanan' })}<small class="package-disclaimer">${e(item.disclaimer)}</small></div></article>`;
}

export function articleCard(item, data) {
  const category = data.article_categories.find((entry) => entry.id === item.category_id);
  return `<article class="article-card blog-boxarea"><a class="article-cover blog-images" href="/artikel/${e(item.slug)}/" tabindex="-1" aria-hidden="true">${image(item.image_url, '', '', { width: 640, height: 420 })}<span class="article-category">${e(category?.name || 'Wawasan Usaha')}</span></a><div class="article-body blog-all-textarea"><div class="article-meta">${item.is_demo ? '<span>Artikel contoh</span><i>•</i>' : ''}<time datetime="${e(item.published_at)}">${e(dateLabel(item.published_at))}</time></div><h3><a href="/artikel/${e(item.slug)}/">${e(item.title)}</a></h3><p>${e(item.excerpt)}</p><a class="text-link" href="/artikel/${e(item.slug)}/">Baca artikel ${icon('arrow')}</a></div></article>`;
}

export function portfolioCard(item, { mock = false } = {}) {
  return `<article class="portfolio-card">${image(item.image_url, mock ? 'Ilustrasi format studi kasus, bukan proyek klien nyata' : item.title)}<div class="portfolio-overlay"><span>${mock ? 'Ilustrasi • bukan proyek nyata' : e(item.category)}</span><h3>${mock ? e(item.title) : `<a href="/portfolio/${e(item.slug)}/">${e(item.title)}</a>`}</h3><p>${e(item.summary)}</p>${mock ? '<span class="sample-label">Contoh format portfolio</span>' : `<a class="round-link" href="/portfolio/${e(item.slug)}/" aria-label="Baca studi kasus ${e(item.title)}">${icon('arrow')}</a>`}</div></article>`;
}

export function galleryGrid(items) {
  return `<div class="gallery-grid">${items.map((item, index) => `<figure class="gallery-item" data-category="${e(item.category)}"><button type="button" class="gallery-open" data-gallery-src="${e(safeUrl(item.image_url, '/assets/images/about-img1.png'))}" data-gallery-caption="${e(item.caption || item.title)}" data-gallery-alt="${e(item.alt_text)}" aria-label="Perbesar gambar: ${e(item.title)}">${image(item.image_url, item.alt_text, '', { width: 600, height: 460 })}<span class="gallery-zoom" aria-hidden="true">↗</span></button><figcaption><span>${e(item.title)}</span><small>${e(item.caption)}</small></figcaption></figure>`).join('')}</div>`;
}

export function closingCta(data) {
  return `<section class="cta-section cta1-section-area" id="konsultasi" aria-labelledby="cta-title"><div class="container"><div class="cta-inner"><div class="cta-copy"><span class="eyebrow">${e(data.home_content.offer_label)}</span><h2 id="cta-title">${lines(data.home_content.closing_headline)}</h2><p>${e(data.home_content.closing_description)}</p></div><div class="cta-action">${contactButton(data, { label: data.home_content.closing_cta_label || 'Konsultasi WhatsApp', placement: 'closing', className: 'button button-yellow', fallback: '/layanan/', fallbackLabel: 'Kenali layanan kami' })}${!whatsappUrl(data.site_settings.whatsapp_number, '') ? '<small>Kontak konsultasi sedang disiapkan.</small>' : '<small>Diskusikan kebutuhan dan cakupan sebelum memilih.</small>'}</div><span class="cta-star">${star}</span></div></div></section>`;
}

export function footer(data) {
  const settings = data.site_settings;
  const socials = Array.isArray(settings.socials) ? settings.socials.filter((item) => safeUrl(item.url)) : [];
  return `<footer class="site-footer footer-section-area"><div class="container"><div class="footer-grid"><div class="footer-brand">${brand(settings)}<p>${e(settings.tagline || 'Pendampingan untuk langkah usaha yang lebih terarah.')}</p>${data._meta.placeholders ? '<span class="sample-label">Identitas bisnis sementara</span>' : ''}</div><div><h2>Jelajahi</h2><a href="/layanan/">Layanan</a><a href="/#paket">Pilihan Paket</a><a href="/artikel/">Artikel & Wawasan</a><a href="/tentang-kami/">Tentang Kami</a></div><div><h2>Kenali Lebih Dekat</h2><a href="/portfolio/">Portfolio</a><a href="/galeri/">Galeri</a><a href="/kebijakan-privasi/">Kebijakan Privasi</a>${socials.map((item) => `<a href="${e(safeUrl(item.url))}" rel="noopener noreferrer" target="_blank">${e(item.label)}</a>`).join('')}</div><div class="footer-contact"><h2>Mari Terhubung</h2>${settings.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email) ? `<a href="mailto:${e(settings.email)}">${e(settings.email)}</a>` : '<p>Email akan dilengkapi</p>'}${settings.address ? `<p>${e(settings.address)}</p>` : '<p>Alamat operasional akan dilengkapi</p>'}${settings.business_hours ? `<p>${e(settings.business_hours)}</p>` : ''}${whatsappUrl(settings.whatsapp_number, '') ? `<a href="${e(whatsappUrl(settings.whatsapp_number, 'Halo, saya ingin berdiskusi tentang kebutuhan usaha saya.'))}" data-wa data-placement="footer" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}${e(settings.whatsapp_number)}</a>` : '<p>Nomor WhatsApp akan dilengkapi</p>'}</div></div><div class="footer-bottom"><p>© ${new Date().getFullYear()} ${e(settings.brand_name)}. Seluruh hak dilindungi.</p><a href="/kebijakan-privasi/">Privasi Anda</a><a href="#top">Kembali ke atas ↑</a></div></div></footer>`;
}

export const lightbox = `<dialog class="lightbox" aria-label="Pratinjau gambar"><button class="lightbox-close" type="button" aria-label="Tutup gambar">${icon('close')}</button><figure><img alt="" width="1000" height="700"><figcaption></figcaption></figure></dialog>`;
