import { e, lines, image, icon, star } from '../lib/html.mjs';
import { contactButton, sectionTitle, pricingNote, pricingCard, serviceCard, articleCard, portfolioCard, galleryGrid, closingCta } from './common.mjs';

const portrait = (src, side) => `<div class="hero-portrait hero-portrait-${side} ${side === 'left' ? 'welcome-header-author-area' : 'welcome-header-author-area1'}" aria-hidden="true"><span class="portrait-orbit orbit-one"></span><span class="portrait-orbit orbit-two"></span><div class="img1">${image(src, '', '', { eager: true, width: 220, height: 220 })}</div><span class="portrait-star">${star}</span>${side === 'left' ? '<span class="portrait-caption">Langkah kecil.<br>Rencana besar.</span>' : '<span class="portrait-caption">Usaha Anda,<br>cerita Anda.</span>'}</div>`;

export function homePage(data) {
  const home = data.home_content;
  const heroCta = contactButton(data, {
    label: home.hero_cta_label || 'Konsultasi Sekarang',
    placement: 'hero',
    message: 'Halo, saya ingin berkonsultasi mengenai kebutuhan legalitas usaha saya.',
    fallback: '#konsultasi',
    fallbackLabel: home.hero_cta_label || 'Konsultasi Sekarang',
  });
  // These layout samples never enter the publication-filtered portfolio collection.
  const portfolioMocks = [
    { title: 'Persiapan usaha kuliner', summary: 'Gambaran format pemetaan kebutuhan awal.', image_url: '/assets/images/casestudy-img1.png' },
    { title: 'Administrasi usaha jasa', summary: 'Gambaran format pemeriksaan kelengkapan.', image_url: '/assets/images/casestudy-img2.png' },
  ];
  return `<section class="welcome-section-area" aria-labelledby="hero-title"><div class="container hero-grid">${portrait(home.hero_image_left, 'left')}<div class="welcome-main-area"><span class="hero-eyebrow spantext">${e(home.hero_label)}</span><h1 id="hero-title">${lines(home.hero_title)}<span class="hero-heading-star">${star}</span></h1><p>${e(home.hero_description)}</p><div class="hero-actions tax-services-btn">${heroCta}<a class="button-text" href="#layanan">${e(home.hero_secondary_label || 'Kenali layanan')} ${icon('arrow')}</a></div><div class="hero-footnote">${icon('check')} Cakupan jelas <span>•</span> Langkah lebih terarah</div></div>${portrait(home.hero_image_right, 'right')}</div><a class="scroll-cue" href="#keunggulan" aria-label="Lihat keunggulan layanan">${icon('down')}</a></section>

  <section class="about1-section-area section-space" id="keunggulan" aria-labelledby="benefits-title"><div class="container"><div class="row align-items-center g-5"><div class="col-lg-6"><div class="about-visual about-imageas-area">${image(home.benefits_image, 'Ilustrasi pembahasan kebutuhan usaha dari aset template', '', { width: 460, height: 460 })}<span class="about-orbit"></span><span class="about-star">${star}</span><span class="visual-caption">Ruang untuk<br><strong>rencana Anda.</strong></span></div></div><div class="col-lg-6"><div class="section-heading heading-left"><span class="eyebrow"><span class="eyebrow-line"></span>Mengapa bersama kami</span><h2 id="benefits-title">${lines(home.benefits_title)}</h2><p>${e(home.benefits_description)}</p></div><div class="benefits-grid">${home.benefits.map((item) => `<div class="benefit"><span>${icon(item.icon)}</span><div><h3>${e(item.title)}</h3><p>${e(item.description)}</p></div></div>`).join('')}</div></div></div></div></section>

  <section class="pricing-section section-space" id="paket" aria-label="Pilihan paket layanan"><div class="container">${sectionTitle('Paket & pendampingan', home.pricing_title, home.pricing_description)}${pricingNote(home)}<div class="pricing-grid">${data.service_packages.map((item) => pricingCard(item, data)).join('') || '<p class="empty-state">Pilihan paket sedang disiapkan. Silakan jelajahi informasi layanan.</p>'}</div></div></section>

  <section class="services1-scetion-area section-space" id="layanan" aria-label="Layanan kami"><div class="container">${sectionTitle('Ruang lingkup layanan', home.services_title, home.services_description)}<div class="services-grid">${data.services.map(serviceCard).join('') || '<p class="empty-state">Informasi layanan sedang disiapkan.</p>'}</div><div class="section-bottom"><p>Belum yakin harus mulai dari mana?</p><a class="text-link" href="/layanan/">Jelajahi semua layanan ${icon('arrow')}</a></div></div></section>

  <section class="work-sectigon-area section-space" id="alur" aria-label="Tahapan pendampingan"><div class="container">${sectionTitle('Bagaimana prosesnya', home.process_title)}<div class="process-layout"><div class="process-steps">${home.process_steps.map((item, index) => `<details class="process-step" ${index === 0 ? 'open' : ''}><summary><span class="step-number">0${index + 1}</span><h3>${e(item.title)}</h3><span class="step-toggle" aria-hidden="true">+</span></summary><p>${e(item.description)}</p></details>`).join('')}</div><div class="process-visual">${image(home.process_steps[0]?.image || home.benefits_image, 'Ilustrasi diskusi tahapan layanan dari aset template', '', { width: 600, height: 510 })}<span class="process-star">${star}</span><div class="process-caption">Satu langkah setiap waktu.<br><strong>Dimulai dari kebutuhan Anda.</strong></div></div></div></div></section>

  <section class="portfolio-section section-space" id="portfolio" aria-label="Portfolio"><div class="container"><div class="split-heading">${sectionTitle('Portfolio & studi kasus', home.portfolio_title, data._meta.placeholders ? 'Ilustrasi berikut memperlihatkan format studi kasus. Bukan proyek atau klien nyata.' : 'Kenali ruang lingkup pendampingan melalui studi kasus yang telah disetujui.', 'left')}<a class="button button-outline" href="/portfolio/">Lihat portfolio ${icon('arrow')}</a></div><div class="portfolio-grid">${data.portfolios.length ? data.portfolios.slice(0, 2).map((item) => portfolioCard(item)).join('') : data._meta.placeholders ? portfolioMocks.map((item) => portfolioCard(item, { mock: true })).join('') : '<p class="empty-state">Studi kasus yang disetujui akan ditampilkan di sini.</p>'}</div></div></section>

  <section class="gallery-section section-space" id="galeri" aria-label="Galeri kegiatan"><div class="container">${sectionTitle('Galeri', home.gallery_title, data._meta.placeholders ? 'Visual ilustrasi dari template untuk memperlihatkan tata letak galeri.' : 'Dokumentasi aktivitas dan ruang kolaborasi.')}${galleryGrid(data.gallery.slice(0, 4))}<div class="section-bottom"><a class="text-link" href="/galeri/">Jelajahi galeri ${icon('arrow')}</a></div></div></section>

  <section class="blog1-section-area section-space" id="artikel" aria-label="Artikel dan wawasan"><div class="container"><div class="split-heading">${sectionTitle('Artikel & wawasan', home.articles_title, 'Bahan bacaan untuk membantu menyiapkan diskusi dan memahami kebutuhan usaha.', 'left')}<a class="button button-outline" href="/artikel/">Semua artikel ${icon('arrow')}</a></div><div class="articles-grid">${data.articles.slice(0, 3).map((item) => articleCard(item, data)).join('') || '<p class="empty-state">Artikel sedang disiapkan.</p>'}</div></div></section>
  ${closingCta(data)}`;
}
