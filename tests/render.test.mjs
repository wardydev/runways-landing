import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { contentData } from '../apps/web/src/data/index.mjs';
import { prepareContent } from '../apps/web/src/lib/content.mjs';
import { getRoutes, renderDocument, notFoundRoute } from '../apps/web/src/lib/pages.mjs';

const data = prepareContent(contentData, { SITE_ENV: 'local' });
const routes = [...getRoutes(data), notFoundRoute];

test('every page has a unique title/canonical, one H1 and no broken local assets or navigation', async () => {
  const paths = new Set(routes.map((route) => route.path));
  const titles = new Set();
  for (const route of routes) {
    const html = renderDocument(data, route);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route.path);
    assert.ok(html.includes('lang="id"'));
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title), `Duplicate title: ${route.path}`);
    titles.add(title);
    assert.match(html, /name="description" content="[^"\s][^"]+"/);
    assert.ok(html.includes(`rel="canonical" href="http://localhost:4321${route.path}"`));
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate DOM id: ${route.path}`);
    for (const match of html.matchAll(/\b(?:src|href)="(\/(?:assets\/[^"?#]+|site\.js|favicon\.svg))"/g)) await access(new URL(`../apps/web/public${match[1]}`, import.meta.url));
    for (const match of html.matchAll(/href="(\/[^"?#]*)?(#[^"]+)?"/g)) {
      const target = match[1] || route.path;
      if (target.startsWith('/assets/') || target.endsWith('.svg')) continue;
      assert.ok(paths.has(target), `Missing internal route ${target} on ${route.path}`);
      if (match[2] && target === route.path) assert.ok(ids.includes(match[2].slice(1)), `Missing anchor ${match[2]}`);
    }
  }
});

test('homepage preserves the nine content sections plus footer, without invented proof', () => {
  const html = renderDocument(data, routes[0]);
  assert.equal((html.match(/<section\b/g) || []).length, 9);
  for (const id of ['keunggulan', 'paket', 'layanan', 'alur', 'portfolio', 'galeri', 'artikel', 'konsultasi']) assert.ok(html.includes(`id="${id}"`));
  assert.match(html, /<footer/);
  assert.ok(!html.includes('Successful Cases'));
  assert.ok(!html.includes('98%'));
  assert.match(html, /Ilustrasi • bukan proyek nyata/);
});

test('client analytics sends an allowlisted event payload without message or phone fields', async () => {
  const script = await readFile(new URL('../apps/web/public/site.js', import.meta.url), 'utf8');
  const eventCall = script.match(/window\.gtag\('event', 'whatsapp_click', \{([^}]+)\}/)[1];
  assert.ok(!eventCall.includes('href'));
  assert.ok(!eventCall.includes('message'));
  assert.ok(!eventCall.includes('phone'));
  assert.match(eventCall, /page_path: location.pathname/);
});
