const path = require('node:path');

module.exports = {
  apps: [{
    name: 'runways-web',
    cwd: __dirname,
    script: path.join(__dirname, 'scripts/serve-static.mjs'),
    interpreter: process.execPath,
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    autorestart: true,
    restart_delay: 2000,
    min_uptime: '10s',
    max_restarts: 10,
    max_memory_restart: '256M',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 6000,
    time: true,
    env: {
      NODE_ENV: 'production',
      RUNWAYS_HOST: process.env.RUNWAYS_HOST || '127.0.0.1',
      RUNWAYS_PORT: process.env.RUNWAYS_PORT || '8080',
      RUNWAYS_STATIC_ROOT: process.env.RUNWAYS_STATIC_ROOT
        || path.join(process.env.RUNWAYS_WEBROOT || '/var/www/runways', 'current'),
    },
  }],
};
