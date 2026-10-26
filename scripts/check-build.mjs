import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = resolve(fileURLToPath(new URL('../apps/web/dist/', import.meta.url)));
const expectedStyles = [
  '/assets/css/bootstrap.min.css',
  '/assets/css/template.css',
  '/assets/css/site.css',
];
const pages = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) pages.push(path);
  }
}
await walk(output);
assert.ok(pages.length, 'Tidak ada halaman HTML hasil build Astro.');
for (const page of pages) {
  const label = relative(output, page);
  const html = await readFile(page, 'utf8');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head, `${label}: head tidak tersedia.`);
  for (const pattern of [/<title>[^<]+<\/title>/, /name="description" content="[^"]+"/, /name="viewport"/, /rel="canonical"/]) {
    assert.match(head, pattern, `${label}: metadata hilang saat kompilasi Astro.`);
  }
  const styles = [...head.matchAll(/<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="([^"]+)")[^>]*>/g)].map((match) => match[1]);
  assert.deepEqual(styles, expectedStyles, `${label}: stylesheet tidak lengkap atau urutannya salah.`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${label}: harus memiliki satu H1.`);
}
for (const stylesheet of expectedStyles) {
  const file = resolve(output, `.${stylesheet}`);
  const css = await readFile(file, 'utf8');
  assert.ok(css.trim(), `${stylesheet}: stylesheet kosong.`);
  for (const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
    const url = match[1];
    if (/^(?:[a-z]+:|\/\/|#)/i.test(url)) continue;
    const target = url.startsWith('/') ? resolve(output, `.${url}`) : resolve(dirname(file), url);
    assert.ok(target.startsWith(output + sep), `${stylesheet}: URL aset keluar dari direktori build.`);
    await access(target);
  }
}
console.log(`Build Astro terverifikasi: ${pages.length} halaman memiliki metadata dan 3 stylesheet; aset CSS ditemukan.`);
