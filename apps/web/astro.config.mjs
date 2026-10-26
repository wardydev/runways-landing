import { defineConfig } from 'astro/config';

try { process.loadEnvFile(new URL('../../.env', import.meta.url)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'http://localhost:4321',
  envDir: '../../',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  server: {
    port: 4321,
    host: '127.0.0.1',
    allowedHosts: ['runways.sewaclaude.id'],
  },
});
