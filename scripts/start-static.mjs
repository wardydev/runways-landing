import { startStaticServer } from './serve-static.mjs';

// PM2 imports ESM through its wrapper, so executable startup must not depend on argv[1].
try {
  const server = await startStaticServer();
  let stopping = false;
  function shutdown() {
    if (stopping) return;
    stopping = true;
    server.close(() => process.exit(0));
    setTimeout(() => { server.closeAllConnections(); process.exit(1); }, 5000).unref();
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error(`Server statis gagal dimulai: ${error.code || error.message}`);
  process.exitCode = 1;
}
