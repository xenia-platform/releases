// The project docs/getting-started.md builds: the site in www/, an API
// behind /api/ with a cache, over HTTPS.

import { defineConfig } from 'xenia';

export default defineConfig({
  tls: {
    certificates: [{ cert: 'site.pem', key: 'site.key' }],
    redirect: true, // plain HTTP gets 308 to https://
    redirectPort: 443, // the port clients reach; xenia listens on 8443
  },
  upstreams: {
    // The compose service's name, which xenia looks up and follows.
    api: { servers: ['api:80'] },
  },
  caches: {
    pages: { size: 64 * 1024 * 1024 },
  },
  routes: [
    { prefix: '/api/', proxy: 'api', cache: 'pages', ttl: 10 },
    { prefix: '/', root: 'www' },
  ],
});
