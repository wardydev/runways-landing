import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { loadContent } from '../apps/web/src/lib/content.mjs';
import { getRoutes, renderDocument, notFoundRoute } from '../apps/web/src/lib/pages.mjs';

async function walk(directory) {
  const files = await readdir(new URL(directory, import.meta.url), { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) await walk(`${directory}/${file.name}`);
    else if (/\.(mjs|js)$/.test(file.name)) {
      const result = spawnSync(process.execPath, ['--check', new URL(`${directory}/${file.name}`, import.meta.url).pathname], { encoding: 'utf8' });
      if (result.status !== 0) throw new Error(result.stderr);
    }
  }
}
for (const directory of ['../scripts', '../apps/web/src', '../apps/web/public']) await walk(directory);
const data = await loadContent({ SITE_ENV: 'local' });
const routes = [...getRoutes(data), notFoundRoute];
const paths = new Set();
for (const route of routes) {
  if (paths.has(route.path)) throw new Error(`Duplicate route ${route.path}`);
  paths.add(route.path);
  const html = renderDocument(data, route);
  if ((html.match(/<h1[ >]/g) || []).length !== 1) throw new Error(`One H1 required: ${route.path}`);
  if (!html.includes('name="description"') || !html.includes('rel="canonical"')) throw new Error(`SEO missing: ${route.path}`);
  if (html.includes('undefined') || html.includes('[object Object]')) throw new Error(`Invalid rendered value: ${route.path}`);
}
console.log(`Syntax modul dan ${routes.length} halaman lolos validasi. Konten dibaca dari JSON lokal.`);
