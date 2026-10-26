import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';
import { createRequire } from 'node:module';
import { createStaticHandler, startStaticServer } from '../scripts/serve-static.mjs';

class Response extends Writable {
  headers = {};
  chunks = [];
  headersSent = false;
  setHeader(name, value) { this.headers[name.toLowerCase()] = value; }
  writeHead(status, headers) {
    this.statusCode = status;
    for (const [name, value] of Object.entries(headers)) this.setHeader(name, value);
    this.headersSent = true;
  }
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  get body() { return Buffer.concat(this.chunks).toString(); }
}

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'runways-static-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, 'release');
  await mkdir(path.join(root, 'artikel/contoh'), { recursive: true });
  await mkdir(path.join(root, 'assets'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), '<h1>Beranda</h1>');
  await writeFile(path.join(root, 'artikel/contoh/index.html'), '<h1>Artikel</h1>');
  await writeFile(path.join(root, '404.html'), '<h1>Tidak ditemukan</h1>');
  await writeFile(path.join(root, 'assets/site.css'), 'body { color: red; }');
  const handler = createStaticHandler({ root });
  const request = async (url, method = 'GET', useHandler = handler) => {
    const response = new Response();
    await useHandler({ url, method }, response);
    return response;
  };
  return { directory, root, request };
}

test('static server serves built nested pages, assets, HEAD and slash redirects', async t => {
  const { request } = await fixture(t);
  const home = await request('/');
  assert.equal(home.statusCode, 200);
  assert.equal(home.body, '<h1>Beranda</h1>');
  const article = await request('/artikel/contoh/?utm_source=tes');
  assert.equal(article.statusCode, 200);
  assert.equal(article.body, '<h1>Artikel</h1>');
  assert.equal(article.headers['content-type'], 'text/html; charset=utf-8');
  assert.equal(article.headers['cache-control'], 'no-cache');
  const redirect = await request('/artikel/contoh?utm_source=tes');
  assert.equal(redirect.statusCode, 308);
  assert.equal(redirect.headers.location, '/artikel/contoh/?utm_source=tes');
  const asset = await request('/assets/site.css');
  assert.equal(asset.statusCode, 200);
  assert.equal(asset.headers['content-type'], 'text/css; charset=utf-8');
  assert.equal(asset.headers['x-content-type-options'], 'nosniff');
  const head = await request('/artikel/contoh/', 'HEAD');
  assert.equal(head.statusCode, 200);
  assert.equal(head.body, '');
  assert.equal(head.headers['content-length'], Buffer.byteLength(article.body));
});

test('missing pages/assets return real 404s; writes and malformed paths are rejected', async t => {
  const { request } = await fixture(t);
  for (const url of ['/artikel/hilang/', '/assets/hilang.css']) {
    const response = await request(url);
    assert.equal(response.statusCode, 404);
    assert.equal(response.body, '<h1>Tidak ditemukan</h1>');
  }
  assert.equal((await request('/hilang/', 'HEAD')).body, '');
  const post = await request('/', 'POST');
  assert.equal(post.statusCode, 405);
  assert.equal(post.headers.allow, 'GET, HEAD');
  for (const url of ['/%ZZ', '//external.test/', 'https://external.test/']) {
    assert.equal((await request(url)).statusCode, 400, url);
  }
  for (const url of ['/.env', '/../secret', '/%2e%2e/secret', '/assets/%2e%2e/%2eenv', '/%5csecret', '/%00']) {
    assert.equal((await request(url)).statusCode, 404, url);
  }
});

test('only release files are exposed, and atomic current changes are picked up without restart', async t => {
  const { directory, root, request } = await fixture(t);
  const secret = path.join(directory, 'secret.txt');
  await writeFile(secret, 'private');
  await symlink(secret, path.join(root, 'outside.txt'));
  assert.equal((await request('/outside.txt')).statusCode, 404);
  const current = path.join(directory, 'current');
  await symlink(root, current);
  const handler = createStaticHandler({ root: current });
  assert.equal((await request('/', 'GET', handler)).body, '<h1>Beranda</h1>');
  const next = path.join(directory, 'next');
  await mkdir(next);
  await writeFile(path.join(next, 'index.html'), '<h1>Release baru</h1>');
  await symlink(next, path.join(directory, 'pending'));
  await rename(path.join(directory, 'pending'), current);
  assert.equal((await request('/', 'GET', handler)).body, '<h1>Release baru</h1>');
  assert.equal((await request('/artikel/contoh/', 'GET', handler)).statusCode, 404);
});

test('server fails before listening when port or built release is invalid', async t => {
  const { root, directory } = await fixture(t);
  await assert.rejects(startStaticServer({ RUNWAYS_STATIC_ROOT: root, RUNWAYS_PORT: 'abc' }), /RUNWAYS_PORT/);
  await assert.rejects(startStaticServer({ RUNWAYS_STATIC_ROOT: directory }), /index.html/);
});

test('PM2 config loads as CommonJS in the ESM repository and runs the static server', () => {
  const require = createRequire(import.meta.url);
  const { apps: [app] } = require('../ecosystem.config.cjs');
  assert.equal(app.name, 'runways-web');
  assert.equal(app.exec_mode, 'fork');
  assert.equal(app.watch, false);
  assert.equal(app.instances, 1);
  assert.equal(app.env.RUNWAYS_HOST, process.env.RUNWAYS_HOST || '127.0.0.1');
  assert.equal(app.script, path.resolve('scripts/serve-static.mjs'));
  assert.equal(app.env.RUNWAYS_STATIC_ROOT, process.env.RUNWAYS_STATIC_ROOT
    || path.join(process.env.RUNWAYS_WEBROOT || '/var/www/runways', 'current'));
});
