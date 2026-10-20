# Xenia

A single-binary web server and reverse proxy, configured in JavaScript.

- **One binary**, under 3 MB: static for Linux (x86_64, arm64), and for macOS on Apple silicon. No runtime, no dependencies.
- **Configured in JavaScript**, with types your editor checks. A reload swaps the whole config atomically: requests in flight finish on the one they started with.
- **Static files** with ETags, ranges, precompressed copies and gzip.
- **Reverse proxy** with load balancing, health checks, WebSockets, upstream hostnames, and a response cache that serves stale content while it refreshes.
- **TLS and HTTP/2**, with virtual hosts, client certificates and HSTS.
- **Rate limits, Prometheus metrics, request IDs and JSON access logs**, and an admin interface.

```js
// xenia.conf.js
export default {
  routes: [
    { path: '/', body: 'hello\n' },
    { prefix: '/static/', root: 'public' },
    { prefix: '/api/', proxy: 'api' },
  ],
  upstreams: { api: { servers: ['127.0.0.1:3000'] } },
};
```

## Installing

```sh
docker run -d -p 80:8080 -v "$PWD:/etc/xenia:ro" ofkindness/xenia
```

Or download an archive from [Releases](https://github.com/xenia-platform/releases/releases): the binary, the docs, an example project and a systemd unit. Releases are signed; the [docs](https://xenia-platform.github.io/#verifying-a-release) say how to check them.

## Links

- [Documentation](https://xenia-platform.github.io): configuration, running, Docker, deployment.
- [Changelog](CHANGELOG.md).
- [Issues](https://github.com/xenia-platform/releases/issues) for questions and bugs; [SECURITY.md](SECURITY.md) for reporting vulnerabilities privately.

## License

Xenia is free to use, commercially or not, under the [Xenia License](LICENSE). Its source is not published.

## Third-party code

Xenia contains libuv, Mbed TLS, QuickJS-ng, zlib and, in the static Linux binaries, mimalloc. These are unmodified upstream releases under their own licenses (MIT, Apache-2.0, zlib), whose texts are in `THIRD_PARTY_LICENSES`.
