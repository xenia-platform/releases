// A single-page app with an API: the built assets, the API behind /api/,
// and index.html for every other path, so the app's own routes load from a
// link or a reload.
//
//   xenia check && xenia --listen 0.0.0.0:8080

import { defineConfig } from 'xenia';

export default defineConfig({
  upstreams: {
    api: { servers: ['127.0.0.1:3000'] },
  },
  routes: [
    // Built with hashed names (app.3f9c1e.js), so they can be kept for good.
    {
      prefix: '/assets/',
      root: 'dist/assets',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
    },
    { prefix: '/api/', proxy: 'api' },
    // Everything else is the app, which reads the path and draws the page.
    // no-cache: browsers check for a new index.html, which names new assets.
    { prefix: '/', file: 'dist/index.html', headers: { 'cache-control': 'no-cache' } },
  ],
});
