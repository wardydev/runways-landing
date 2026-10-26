import test from 'node:test';
import assert from 'node:assert/strict';
import { contentData } from '../apps/web/src/data/index.mjs';
import { prepareContent } from '../apps/web/src/lib/content.mjs';
import { getRoutes, renderDocument } from '../apps/web/src/lib/pages.mjs';

const local = { SITE_ENV: 'local' };
const renderPricingPages = (data) => getRoutes(data).filter((route) => route.type === 'home' || (route.type === 'service' && data.service_packages.some((item) => item.service_id === route.item.id))).map((route) => renderDocument(data, route));

test('JSON pricing note can be hidden while unrelated demo content and production guards remain active', () => {
  const raw = structuredClone(contentData);
  raw.home_content.pricing_note_enabled = false;
  const data = prepareContent(raw, local);
  assert.equal(data._meta.placeholders, true);
  const pages = renderPricingPages(data);
  assert.ok(pages.length > 1);
  for (const html of pages) assert.ok(!html.includes('class="pricing-note"'));
  assert.throws(() => prepareContent(raw, { SITE_ENV: 'production', SITE_URL: 'https://example.test' }), /placeholder/);
});

test('JSON pricing note supports independent copy on homepage and service pages with safe multiline text', async () => {
  const raw = structuredClone(contentData);
  raw.home_content.pricing_note_title = '<script>unsafe</script>';
  raw.home_content.pricing_note_text = 'Biaya sesuai cakupan.\nHubungi kami untuk penawaran.';
  const data = prepareContent(raw, local);
  for (const html of renderPricingPages(data)) {
    assert.ok(html.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
    assert.ok(!html.includes('<script>unsafe</script>'));
    assert.ok(html.includes('Biaya sesuai cakupan.<br>Hubungi kami untuk penawaran.'));
    assert.ok(!html.includes('Catatan pratinjau'));
  }
});

test('empty pricing text leaves no empty note; omitted optional settings get defaults without source mutation', () => {
  const raw = structuredClone(contentData);
  raw.home_content.pricing_note_text = '  ';
  for (const html of renderPricingPages(prepareContent(raw, local))) assert.ok(!html.includes('class="pricing-note"'));
  delete raw.home_content.pricing_note_enabled;
  delete raw.home_content.pricing_note_text;
  const data = prepareContent(raw, local);
  assert.equal(data.home_content.pricing_note_enabled, false);
  assert.equal(raw.home_content.pricing_note_enabled, undefined);
  raw.home_content.pricing_note_enabled = 'false';
  assert.throws(() => prepareContent(raw, local), /pricing_note_enabled/);
});

