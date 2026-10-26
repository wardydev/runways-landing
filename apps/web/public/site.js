(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const setMenu = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) nav.style.top = `${toggle.closest('header').getBoundingClientRect().bottom}px`;
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    if (event.key === 'Tab' && toggle?.getAttribute('aria-expanded') === 'true') {
      const links = [...nav.querySelectorAll('a')];
      const last = links.at(-1);
      if (event.shiftKey && document.activeElement === toggle) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); toggle.focus(); }
    }
  });
  window.matchMedia('(min-width: 992px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

  // Native details preserve readable, usable content without JavaScript.
  const processSteps = document.querySelectorAll('.process-step');
  processSteps.forEach((details) => details.addEventListener('toggle', () => {
    if (details.open) processSteps.forEach((other) => { if (other !== details) other.open = false; });
  }));

  const lightbox = document.querySelector('.lightbox');
  let previousGalleryFocus = null;
  document.querySelectorAll('[data-gallery-src]').forEach((button) => button.addEventListener('click', () => {
    if (!lightbox?.showModal) return;
    const img = lightbox.querySelector('img');
    img.src = button.dataset.gallerySrc;
    img.alt = button.dataset.galleryAlt || '';
    lightbox.querySelector('figcaption').textContent = button.dataset.galleryCaption || '';
    previousGalleryFocus = button;
    lightbox.showModal();
  }));
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox?.addEventListener('close', () => previousGalleryFocus?.focus());
  document.querySelectorAll('[data-gallery-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.galleryFilter;
    let count = 0;
    document.querySelectorAll('.gallery-item').forEach((item) => { item.hidden = filter !== 'all' && item.dataset.category !== filter; if (!item.hidden) count++; });
    document.querySelectorAll('[data-gallery-filter]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    const status = document.querySelector('.filter-result');
    if (status) status.textContent = `${count} gambar ditampilkan.`;
  }));

  const consentBanner = document.querySelector('[data-analytics]');
  let analyticsEnabled = false;
  const consentKey = 'runways.analytics-consent';
  const readConsent = () => { try { return localStorage.getItem(consentKey); } catch { return null; } };
  function enableAnalytics() {
    if (analyticsEnabled || !consentBanner) return;
    const measurementId = consentBanner.dataset.analytics;
    if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
    analyticsEnabled = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: true, page_location: location.origin + location.pathname, page_referrer: '', allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }
  if (consentBanner) {
    const choice = readConsent();
    if (choice === 'granted') enableAnalytics();
    else if (choice !== 'denied') consentBanner.hidden = false;
    consentBanner.querySelectorAll('[data-consent]').forEach((button) => button.addEventListener('click', () => {
      try { localStorage.setItem(consentKey, button.dataset.consent); } catch { /* preference applies to this page even if storage is unavailable */ }
      consentBanner.hidden = true;
      if (button.dataset.consent === 'granted') enableAnalytics();
    }));
  }
  document.querySelector('[data-reset-consent]')?.addEventListener('click', (event) => {
    try { localStorage.removeItem(consentKey); } catch { /* storage may be disabled */ }
    if (consentBanner) { location.reload(); }
    else { event.currentTarget.textContent = 'Analytics tidak aktif pada lingkungan ini'; }
  });
  document.querySelectorAll('[data-wa]').forEach((link) => link.addEventListener('click', () => {
    if (!analyticsEnabled) return;
    window.gtag('event', 'whatsapp_click', { page_path: location.pathname, placement: link.dataset.placement || 'general', service: link.dataset.service || '', package: link.dataset.package || '' });
  }));
})();
