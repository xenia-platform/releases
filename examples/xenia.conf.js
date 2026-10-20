// An example xenia configuration, as it would sit in a project.
//
//   cd examples && xenia               serve it: xenia.conf.js is the default
//   xenia check                        compile and validate, print the routes
//   xenia types                        xenia.d.ts, for editors to check this with
//
// Edit it, or pages.js, then `kill -HUP` to reload. With --admin
// /tmp/xenia.sock, `xenia ctl --admin /tmp/xenia.sock status` shows what
// runs, and `... flags NAME=on` switches flags live.

import { defineConfig } from 'xenia';
import { pages } from './pages.js';

// A 1x1 transparent GIF.
const pixel = Uint8Array.from(
  atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
  (c) => c.charCodeAt(0),
);

export default defineConfig({
  // Optional; these are the defaults.
  // server: {
  //   headerTimeout: 10, idleTimeout: 30, writeTimeout: 30,  // seconds
  //   maxConnections: 10000, shutdownTimeout: 10,
  //   maxRequestBody: 16 * 1024 * 1024,                      // bytes
  // },

  // HTTPS, with --listen-tls. Paths are relative to this file; SNI picks
  // the certificate, the first is the default.
  // tls: {
  //   certificates: [
  //     { cert: 'certs/example.test.pem', key: 'certs/example.test.key' },
  //     // admin.example.test only for staff certificates:
  //     { cert: 'certs/admin.pem', key: 'certs/admin.key',
  //       clients: { ca: 'certs/staff-ca.pem', crl: 'certs/staff.crl' } },
  //   ],
  //   redirect: true,              // plain HTTP gets 308 to https://
  //   hsts: { maxAge: 31536000 },  // seconds
  // },

  // Feature flags, which routes can depend on and the admin interface can
  // switch live: a route with flag: 'beta' is served while beta is on, one
  // with flag: '!beta' while it is off.
  // flags: { beta: false },

  // Servers that proxy routes forward to, by IP:port. To try it, run
  // `python3 -m http.server 8000` in a directory that has a static/ folder.
  upstreams: {
    files: { servers: ['127.0.0.1:8000'] },
    // Two servers, each checked every 5 s: requests go to the one with
    // fewer in flight, and skip one that fails 3 checks in a row.
    // app: { servers: ['10.0.0.5:8080', '10.0.0.6:8080'],
    //        balance: 'least-connections',
    //        healthCheck: { path: '/healthz', interval: 5, timeout: 2 },
    //        tunnelIdleTimeout: 300 },  // seconds a WebSocket may sit idle
    // Over TLS: servers are addresses, so name the one their certificate
    // must show, and the CA that signed it.
    // api: { servers: ['10.0.0.5:443'],
    //        tls: { serverName: 'api.internal', ca: 'certs/internal-ca.pem' } },
  },

  routes: [
    { path: '/', body: 'hello from xenia\n' },
    { path: '/old', status: 301, headers: { location: '/' } },
    {
      path: '/api/health',
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
      allowHttp: true, // plain HTTP even with tls.redirect
    },
    { path: '/pixel.gif', contentType: 'image/gif', body: pixel },
    ...pages,
    // Everything under /static/, any method, from the files upstream.
    { prefix: '/static/', proxy: 'files' },
    // Files from the www directory beside this config: /assets/ is its
    // index.html. Precompressed copies (name.br, name.gz) go to clients
    // that take them.
    { prefix: '/assets/', root: 'www', precompressed: true },
    // The app sees /app/users as /users; WebSocket upgrades go through too.
    // { prefix: '/app/', proxy: 'app', rewrite: '/' },
    // A site of its own: requests for example.test (try curl -H 'Host:
    // example.test') get only this route; other hosts get those above.
    { host: 'example.test', path: '/', body: 'hello from example.test\n' },
  ],
});
