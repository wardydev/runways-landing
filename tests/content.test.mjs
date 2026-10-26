import test from 'node:test';
import assert from 'node:assert/strict';
import { contentData } from '../apps/web/src/data/index.mjs';
import { config, prepareContent, loadContent } from '../apps/web/src/lib/content.mjs';
import { getRoutes, renderDocument, robots, sitemap } from '../apps/web/src/lib/pages.mjs';
import { whatsappUrl, safeUrl, richText, jsonLd } from '../apps/web/src/lib/html.mjs';

const local = { SITE_ENV: 'local' };
const source = () => structuredClone(contentData);

test('unpublished services, orphaned packages, future articles and unapproved portfolios stay out of all routes and HTML', () => {
  const raw = source();
  raw.services[1].status = 'draft';
  raw.articles[0].published_at = '2099-01-01T00:00:00Z';
  raw.portfolios[0].status = 'published';
  const data = prepareContent(raw, local);
  assert.equal(data.services.length, 2);
  assert.equal(data.service_packages.length, 1);
  assert.equal(data.articles.length, 2);
  assert.equal(data.portfolios.length, 0);
  const paths = getRoutes(data).map((route) => route.path);
  assert.ok(!paths.includes('/layanan/administrasi-perizinan/'));
  assert.ok(!paths.includes(`/artikel/${raw.articles[0].slug}/`));
  assert.ok(!paths.includes(`/portfolio/${raw.portfolios[0].slug}/`));
});

test('approved published portfolios become available; draft consent alone is insufficient', () => {
  const raw = source();
  raw.portfolios[0].consent_to_publish = true;
  assert.equal(prepareContent(raw, local).portfolios.length, 0);
  raw.portfolios[0].status = 'published';
  const data = prepareContent(raw, local);
  assert.equal(data.portfolios.length, 1);
  assert.ok(getRoutes(data).some((route) => route.path === `/portfolio/${raw.portfolios[0].slug}/`));
});

test('duplicate/unsafe slugs and missing SEO stop the build', () => {
  const raw = source();
  raw.services[1].slug = raw.services[0].slug;
  assert.throws(() => prepareContent(raw, local), /duplikat/);
  raw.services[1].slug = '../draft';
  assert.throws(() => prepareContent(raw, local), /Slug/);
  raw.services[1].slug = 'valid';
  raw.articles[1].seo_description = '';
  assert.throws(() => prepareContent(raw, local), /seo_description/);
});

test('invalid and misleading prices fail; multiple packages per service remain supported', () => {
  const raw = source();
  assert.equal(prepareContent(raw, local).service_packages.filter((item) => item.service_id === raw.services[1].id).length, 2);
  raw.service_packages[0].price = -1;
  assert.throws(() => prepareContent(raw, local), /Harga paket/);
  raw.service_packages[0].price = 750000;
  raw.service_packages[0].compare_at_price = 500000;
  assert.throws(() => prepareContent(raw, local), /pembanding/);
  raw.service_packages[0].compare_at_price = 900000;
  raw.service_packages[0].deliverables = 'wrong';
  assert.throws(() => prepareContent(raw, local), /Cakupan paket/);
});

test('production requires HTTPS and approved content', () => {
  assert.throws(() => config({ ...local, SITE_ENV: 'production' }), /Produksi/);
  const env = { SITE_ENV: 'production', SITE_URL: 'https://example.test' };
  assert.throws(() => prepareContent(source(), env), /placeholder/);
  const raw = source();
  raw.site_settings.placeholder_mode = false;
  for (const value of Object.values(raw)) if (Array.isArray(value)) for (const item of value) item.is_demo = false;
  const data = prepareContent(raw, env);
  assert.equal(data._meta.noindex, false);
  assert.match(robots(data), /Allow: \//);
  assert.match(sitemap(data), /https:\/\/example.test\/layanan\//);
});

test('WhatsApp requires E.164 and safely encodes context', () => {
  assert.equal(whatsappUrl('', 'halo'), null);
  assert.equal(whatsappUrl('081234567890', 'halo'), null);
  assert.equal(whatsappUrl('+6281234567890', 'PT & CV? paket #1'), 'https://wa.me/6281234567890?text=PT%20%26%20CV%3F%20paket%20%231');
  const data = prepareContent(source(), local);
  data.site_settings.whatsapp_number = '';
  const home = renderDocument(data, getRoutes(data)[0]);
  assert.ok(!home.includes('wa.me/'));
  data.site_settings.whatsapp_number = '+6281234567890';
  const active = renderDocument(data, getRoutes(data)[0]);
  assert.match(active, /data-placement="pricing"/);
  assert.match(active, /rel="noopener noreferrer"/);
});

test('Article rich text, images and JSON-LD cannot inject executable markup', () => {
  const payload = '<img src=x onerror=alert(1)><script>alert(2)</script><p onclick=alert(3)>hello</p><strong>safe</strong>';
  const html = richText(payload);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img '));
  assert.ok(!html.includes('<p onclick'));
  assert.match(html, /<strong>safe<\/strong>/);
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('//evil.test/x'), '');
  assert.equal(safeUrl('/\\evil.test'), '');
  assert.ok(!jsonLd({ name: '</script><script>alert(1)</script>' }).includes('</script>'));
  const raw = source();
  raw.site_settings.brand_name = '"><script>alert(1)</script>';
  const data = prepareContent(raw, local);
  assert.ok(!renderDocument(data, getRoutes(data)[0]).includes('<script>alert(1)</script>'));
});

test('content loads from local JSON without any network requests', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Network must not be used'); };
  try {
    const data = await loadContent(local);
    assert.equal(data.articles.length, contentData.articles.length);
    assert.equal(data.gallery.length, contentData.gallery.length);
    assert.equal(data.site_settings.whatsapp_number, '+6287754175829');
  } finally { globalThis.fetch = originalFetch; }
});

test('JSON price and gallery edits reach rendered pages', () => {
  const raw = source();
  raw.service_packages[0].price = 987654;
  raw.gallery[0].caption = 'Caption dari JSON yang diperbarui';
  const data = prepareContent(raw, local);
  const html = renderDocument(data, getRoutes(data)[0]);
  assert.match(html, /987\.654/);
  assert.ok(html.includes('Caption dari JSON yang diperbarui'));
});

test('gallery JSON publication controls both homepage and gallery without exposing draft captions', () => {
  const raw = source();
  raw.gallery[0].status = 'draft';
  raw.gallery[0].caption = 'Draft gallery caption must stay hidden';
  const data = prepareContent(raw, local);
  assert.equal(data.gallery.length, raw.gallery.length - 1);
  for (const route of getRoutes(data).filter((route) => ['home', 'gallery'].includes(route.type))) {
    assert.ok(!renderDocument(data, route).includes('Draft gallery caption must stay hidden'));
  }
});

test('invalid IDs, status, categories and publication dates stop JSON builds', () => {
  const raw = source();
  raw.gallery[1].id = raw.gallery[0].id;
  assert.throws(() => prepareContent(raw, local), /id wajib unik/);
  raw.gallery[1].id = 'valid-gallery';
  raw.gallery[1].status = 'publshed';
  assert.throws(() => prepareContent(raw, local), /status harus/);
  raw.gallery[1].status = 'published';
  raw.articles[0].category_id = 'missing-category';
  assert.throws(() => prepareContent(raw, local), /category_id/);
  raw.articles[0].category_id = raw.article_categories[0].id;
  raw.articles[0].published_at = 'invalid';
  assert.throws(() => prepareContent(raw, local), /published_at/);
});

test('article category pages and server-rendered pagination preserve access to all published items', () => {
  const raw = source();
  for (let index = 0; index < 9; index++) raw.articles.push({ ...raw.articles[0], id: `copy-${index}`, slug: `article-${index}` });
  const data = prepareContent(raw, local);
  const routes = getRoutes(data);
  assert.ok(routes.some((route) => route.path === '/artikel/halaman/2/'));
  assert.ok(routes.some((route) => route.path === '/artikel/kategori/memulai-usaha/halaman/2/'));
  const pages = routes.filter((route) => route.type === 'articles' && !route.category);
  assert.equal(pages.flatMap((route) => route.items).length, data.articles.length);
});

test('local and staging never expose an indexable sitemap', () => {
  for (const SITE_ENV of ['local', 'staging']) {
    const data = prepareContent(source(), { ...local, SITE_ENV });
    assert.match(robots(data), /Disallow: \//);
    assert.ok(!sitemap(data).includes('<url>'));
    assert.match(renderDocument(data, getRoutes(data)[0]), /noindex, nofollow/);
  }
});
