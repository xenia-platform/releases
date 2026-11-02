// A static site, compressed when it is built: each file beside its .br and
// .gz copies (brotli -k, gzip -k), sent to the clients that take them, at
// levels too slow to spend on every request.
//
//   xenia check && xenia --listen 0.0.0.0:8080

import { defineConfig } from 'xenia';

export default defineConfig({
  routes: [
    { path: '/robots.txt', file: 'site/robots.txt', headers: { 'cache-control': 'max-age=86400' } },
    {
      prefix: '/',
      root: 'site',
      precompressed: true,
      headers: { 'cache-control': 'max-age=300' },
    },
  ],
});
