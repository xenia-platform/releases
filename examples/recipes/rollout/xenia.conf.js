// Moving from one backend (blue) to its replacement (green) a route at a
// time, with feature flags. Each switch is live, needs no reload, and goes
// back the same way. Flags switch whole routes: there are no percentages.
//
//   xenia --listen 0.0.0.0:8080 --admin /run/xenia/admin.sock
//   xenia ctl flags green-export=on    exports go to green first
//   xenia ctl flags green=on           then the rest of /api/
//   xenia ctl flags green=off          ...and back, if green misbehaves

import { defineConfig } from 'xenia';

export default defineConfig({
  upstreams: {
    blue: { servers: ['127.0.0.1:3001'] },
    green: { servers: ['127.0.0.1:3002'] },
  },
  flags: { 'green-export': false, green: false },
  routes: [
    // While the flag is off, this route is not there, and /api/ has export.
    { prefix: '/api/export/', proxy: 'green', flag: 'green-export' },
    { prefix: '/api/', proxy: 'green', flag: 'green' },
    { prefix: '/api/', proxy: 'blue', flag: '!green' },
  ],
});
