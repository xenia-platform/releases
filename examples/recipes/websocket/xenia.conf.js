// An app that talks over WebSockets: its socket endpoint proxied, the rest
// of the site static. Any proxy route passes an upgrade through; what is
// worth setting is how long a quiet socket stays open, and how many one
// client may hold.
//
//   xenia check && xenia --listen 0.0.0.0:8080

import { defineConfig } from 'xenia';

export default defineConfig({
  upstreams: {
    // A socket with nothing on it for ten minutes is closed.
    app: { servers: ['127.0.0.1:3000'], tunnelIdleTimeout: 600 },
  },
  limits: {
    // An open socket is a request in flight: 4 at once per client.
    sockets: { inFlight: 4 },
  },
  routes: [
    { prefix: '/ws/', proxy: 'app', limit: 'sockets' },
    { prefix: '/', root: 'public' },
  ],
});
