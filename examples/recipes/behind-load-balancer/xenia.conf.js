// Behind a load balancer or a CDN that ends TLS and connects from
// 10.0.0.0/8. Its X-Forwarded-For names each client: for the limits, the
// access log, and the X-Forwarded-For that goes upstream.
//
//   xenia check && xenia --listen 0.0.0.0:8080

import { defineConfig } from 'xenia';

export default defineConfig({
  server: {
    trustedProxies: ['10.0.0.0/8'],
    // No maxConnectionsPerClient: every connection comes from the
    // balancer, which it would not count anyway. The limit below does.
  },
  upstreams: {
    app: { servers: ['127.0.0.1:3000'] },
  },
  limits: {
    // Per client, not per balancer: 20 a second, bursts of 40, and at most
    // 10 requests in flight at once.
    perClient: { rate: 20, burst: 40, inFlight: 10 },
  },
  routes: [
    { path: '/healthz', body: 'ok\n' }, // for the balancer's health checks
    { prefix: '/', proxy: 'app', limit: 'perClient' },
  ],
});
