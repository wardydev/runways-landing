import { createServer } from 'node:http';
import { open, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const defaultRoot = fileURLToPath(new URL('../apps/web/dist/', import.meta.url));
const missingCodes = new Set(['ENOENT', 'ENOTDIR', 'EACCES']);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

function inside(root, filename) {
  const relative = path.relative(root, filename);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

async function findFile(root, filename) {
  try {
    const resolved = await realpath(filename);
    if (!inside(root, resolved)) return null;
    return { filename: resolved, info: await stat(resolved) };
  } catch (error) {
    if (missingCodes.has(error.code)) return null;
    throw error;
  }
}

async function sendFile(request, response, file, status) {
  const handle = await open(file.filename, 'r');
  try {
    const info = await handle.stat();
    const extension = path.extname(file.filename).toLowerCase();
    response.writeHead(status, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Content-Length': info.size,
      // Assets have stable filenames, so do not cache them as immutable.
      'Cache-Control': status !== 200 || extension === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    if (request.method === 'HEAD') response.end();
    else await pipeline(handle.createReadStream(), response);
  } finally {
    await handle.close();
  }
}

function sendText(request, response, status, message, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(message),
    'Cache-Control': 'no-store',
    ...headers,
  });
  response.end(request.method === 'HEAD' ? undefined : message);
}

export function createStaticHandler({ root = defaultRoot } = {}) {
  const configuredRoot = path.resolve(root);
  return async function handleRequest(request, response) {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        sendText(request, response, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
        return;
      }
      const target = request.url || '/';
      if (!target.startsWith('/') || target.startsWith('//') || /[\x00-\x1f\x7f]/.test(target)) {
        sendText(request, response, 400, 'Bad Request');
        return;
      }
      const queryIndex = target.indexOf('?');
      const rawPath = queryIndex === -1 ? target : target.slice(0, queryIndex);
      const query = queryIndex === -1 ? '' : target.slice(queryIndex);
      let pathname;
      try { pathname = decodeURIComponent(rawPath); }
      catch {
        sendText(request, response, 400, 'Bad Request');
        return;
      }
      // Check before normalizing paths; block hidden files and traversal, including encoded variants.
      if (/[\\\x00-\x1f\x7f]/.test(pathname) || pathname.split('/').some(part => part.startsWith('.'))) {
        sendText(request, response, 404, 'Not Found');
        return;
      }
      // Resolve the release on each request so switching `current` does not need a PM2 restart.
      const releaseRoot = await realpath(configuredRoot);
      let file = await findFile(releaseRoot, path.resolve(releaseRoot, `.${pathname}`));
      if (file?.info.isDirectory()) {
        file = await findFile(releaseRoot, path.join(file.filename, 'index.html'));
        if (file?.info.isFile() && !rawPath.endsWith('/')) {
          sendText(request, response, 308, 'Permanent Redirect', { Location: `${rawPath}/${query}` });
          return;
        }
      }
      if (file?.info.isFile()) {
        await sendFile(request, response, file, 200);
        return;
      }
      const notFound = await findFile(releaseRoot, path.join(releaseRoot, '404.html'));
      if (notFound?.info.isFile()) await sendFile(request, response, notFound, 404);
      else sendText(request, response, 404, 'Not Found');
    } catch (error) {
      if (response.headersSent) response.destroy(error);
      else sendText(request, response, 503, 'Service Unavailable');
      if (!['ERR_STREAM_PREMATURE_CLOSE', 'ECONNRESET'].includes(error.code)) {
        console.error(`Static request failed: ${error.code || 'UNKNOWN'}`);
      }
    }
  };
}

export async function startStaticServer(env = process.env) {
  const root = path.resolve(env.RUNWAYS_STATIC_ROOT || defaultRoot);
  const port = Number(env.RUNWAYS_PORT || 4321);
  const host = env.RUNWAYS_HOST || '127.0.0.1';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('RUNWAYS_PORT harus berupa port 1–65535.');
  let releaseRoot;
  try { releaseRoot = await realpath(root); }
  catch (error) {
    if (missingCodes.has(error.code)) {
      throw new Error(`Root hasil build tidak tersedia: ${root}. Jalankan npm run build atau periksa RUNWAYS_STATIC_ROOT dan izin direktori.`);
    }
    throw error;
  }
  const index = await findFile(releaseRoot, path.join(releaseRoot, 'index.html'));
  if (!index?.info.isFile()) throw new Error(`index.html tidak ditemukan di ${root}. Jalankan npm run build atau periksa RUNWAYS_STATIC_ROOT.`);
  const server = createServer(createStaticHandler({ root }));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  console.log(`Runways static: http://${host}:${port} → ${root}`);
  if (process.send) process.send('ready');
  return server;
}

