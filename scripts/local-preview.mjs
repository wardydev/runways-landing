// Dependency-free LOCAL preview using exactly the same template functions as Astro.
// It is intentionally noindex and refuses production. Production always uses Astro.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { loadContent } from '../apps/web/src/lib/content.mjs';
import { renderDocument, getRoutes, notFoundRoute, sitemap, robots } from '../apps/web/src/lib/pages.mjs';

try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (process.env.SITE_ENV === 'production') throw new Error('Preview lokal tidak boleh dipakai untuk produksi. Gunakan npm run build.');
const port = Number(process.env.PREVIEW_PORT || 4321);
const data = await loadContent({ ...process.env, SITE_ENV: 'local', SITE_URL: `http://localhost:${port}` });
const routes = getRoutes(data);
const pages = new Map(routes.map((route) => [route.path, renderDocument(data, route)]));
const notFound = renderDocument(data, notFoundRoute);
const publicDir = fileURLToPath(new URL('../apps/web/public', import.meta.url));
const output = fileURLToPath(new URL('../.local-preview', import.meta.url));

function fileFriendly(html, path) {
  const prefix = '../'.repeat(path.split('/').filter(Boolean).length) || './';
  return html.replace(/\b(src|href|data-gallery-src)="(\/[^"\s]*)"/g, (match, attribute, value) => {
    if (value.startsWith('//')) return match;
    const [pathname, hash] = value.split('#');
    const destination = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1);
    return `${attribute}="${prefix}${destination}${hash ? `#${hash}` : ''}"`;
  });
}

if (process.argv.includes('--build')) {
  // Recreate the output tree so unpublished/deleted routes cannot linger.
  const { rm } = await import('node:fs/promises');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(publicDir, output, { recursive: true });
  for (const [path, html] of pages) {
    const target = resolve(output, `.${path}`, 'index.html');
    await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, fileFriendly(html, path));
  }
  await writeFile(resolve(output, '404.html'), fileFriendly(notFound, '/'));
  await writeFile(resolve(output, 'sitemap.xml'), sitemap(data));
  await writeFile(resolve(output, 'robots.txt'), robots(data));
  console.log(`Preview lokal: ${pages.size} halaman di .local-preview/ (noindex). Build Astro produksi belum dijalankan oleh perintah ini.`);
} else {
  const mime = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
  const server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); return response.end(); }
      const url = new URL(request.url, `http://localhost:${port}`);
      if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') {
        response.writeHead(200, { 'Content-Type': url.pathname.endsWith('.xml') ? 'application/xml' : 'text/plain', 'X-Robots-Tag': 'noindex' });
        return response.end(request.method === 'HEAD' ? '' : url.pathname.endsWith('.xml') ? sitemap(data) : robots(data));
      }
      const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
      if (pages.has(path)) { response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }); return response.end(request.method === 'HEAD' ? '' : pages.get(path)); }
      const file = resolve(publicDir, `.${decodeURIComponent(url.pathname)}`);
      if (!file.startsWith(publicDir + sep)) throw new Error('Invalid path');
      const asset = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? '' : asset);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' });
      response.end(request.method === 'HEAD' ? '' : notFound);
    }
  });
  server.on('error', (error) => {
    console.error(`Preview HTTP tidak dapat dijalankan (${error.code}). Gunakan npm run build:local lalu buka .local-preview/index.html.`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Local: http://localhost:${port}\nPreview lokal menggunakan template yang sama dengan Astro. Restart setelah perubahan source/JSON.`));
}
