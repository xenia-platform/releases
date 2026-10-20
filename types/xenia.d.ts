// Types for xenia 0.15.1 configs, from `xenia types`: run it again after
// upgrading xenia. The rules in full:
// https://xenia-platform.github.io/configuration/

/** Base64 to a binary string, as xenia configs have it. */
declare function atob(data: string): string;
/** A binary string to base64. */
declare function btoa(data: string): string;

declare module 'xenia' {
  /**
   * Returns `config` as it is: wrapping the default export in it lets
   * editors check the config against these types.
   */
  export function defineConfig(config: Config): Config;

  /** Seconds; fractions are allowed unless it says whole. */
  export type Seconds = number;

  /** The default export of a config. Unknown keys are errors. */
  export interface Config {
    /** The routes, in order; each is static, proxied or served from files. */
    routes: Route[];
    /** Timeouts and limits; a reload changes them without a restart. */
    server?: Server;
    /** Groups of HTTP/1.1 servers that proxy routes forward to, by name. */
    upstreams?: Record<string, Upstream>;
    /** HTTPS for `--listen-tls`. */
    tls?: Tls;
    /**
     * Feature flags and their values, switched live through the admin
     * interface. A name is 1-32 lowercase letters, digits, `_` or `-`,
     * starting with a letter; at most 64.
     */
    flags?: Record<string, boolean>;
    /** Rate limits that routes count clients' requests against; at most 64. */
    limits?: Record<string, Limit>;
    /** Response caches in memory that proxy routes keep responses in. */
    caches?: Record<string, Cache>;
  }

  /** What every kind of route has. */
  interface RouteBase {
    /**
     * Serve only this host: a DNS name, or `*.` and one (exactly one more
     * label), compared without case. Without it, the route is in the
     * default site.
     */
    host?: string;
    /** Served over plain HTTP even with `tls.redirect`. @default false */
    allowHttp?: boolean;
    /** Only to clients with a verified certificate, else `403`. @default false */
    clientCert?: boolean;
    /** Served only while the flag is on (`'name'`) or off (`'!name'`). */
    flag?: string;
    /** Count each client's requests against this rate limit. */
    limit?: string;
    /**
     * Gzip responses worth it for clients that take it.
     * @default true, false on proxy routes
     */
    compress?: boolean;
    /** Extra response headers, up to 32; names the server sets are refused. */
    headers?: Record<string, string>;
  }

  /** Exactly one of `path` and `prefix`. */
  type Match =
    | {
        /** Exact match: starts with `/`, visible ASCII, no `?` or `#`. */
        path: string;
        prefix?: never;
      }
    | {
        /** Matches every path that starts with it: starts and ends with `/`. */
        prefix: string;
        path?: never;
      };

  /** What only file routes have. */
  interface NoFileFields {
    root?: never;
    index?: never;
    listing?: never;
    precompressed?: never;
    followSymlinks?: never;
    contentTypes?: never;
  }

  /** What only proxy routes have. */
  interface NoProxyFields {
    proxy?: never;
    rewrite?: never;
    cache?: never;
    ttl?: never;
    staleWhileRevalidate?: never;
    staleIfError?: never;
  }

  /** A route that answers with its own response. */
  export type StaticRoute = RouteBase &
    Match &
    NoFileFields &
    NoProxyFields & {
      /** An HTTP token; `HEAD` is answered from `GET`. @default 'GET' */
      method?: string;
      /** 200-599, except 204, 205 and 304. @default 200 */
      status?: number;
      /**
       * `''` sends none.
       * @default 'text/plain; charset=utf-8' for strings, 'application/octet-stream' for bytes
       */
      contentType?: string;
      /** A string (sent as UTF-8) or bytes; at most 1 MiB, 64 MiB per config. @default '' */
      body?: string | Uint8Array | ArrayBuffer;
    };

  /** A route that forwards to an upstream group. */
  export type ProxyRoute = Omit<RouteBase, 'headers'> &
    Match &
    NoFileFields & {
      /** The upstream group to forward to. */
      proxy: string;
      /** An HTTP token. @default every method */
      method?: string;
      /**
       * Replaces the part of the path the route matched; on a prefix route
       * it starts and ends with `/`.
       */
      rewrite?: string;
      /** The cache to keep the upstream's responses in. */
      cache?: string;
      /** Whole seconds a response stays fresh when the upstream gives no lifetime; 1 s to a year. */
      ttl?: Seconds;
      /** Whole seconds past its lifetime a response may be served while it is refreshed. */
      staleWhileRevalidate?: Seconds;
      /** Whole seconds past its lifetime a response may be served while the upstream fails. */
      staleIfError?: Seconds;
      status?: never;
      contentType?: never;
      headers?: never;
      body?: never;
    };

  /** A route that serves the files in a directory. */
  export type FileRoute = RouteBase &
    NoProxyFields & {
      /** File routes take the prefix form: starts and ends with `/`. */
      prefix: string;
      path?: never;
      /** The directory, relative to the config file. */
      root: string;
      /** File routes answer `GET` and `HEAD`. @default 'GET' */
      method?: 'GET';
      /** A name or up to 8: the file to serve for a directory; `[]` for none. @default ['index.html'] */
      index?: string | string[];
      /** A directory without an index file gets a page listing it. @default false */
      listing?: boolean;
      /** Serve `name.br` or `name.gz` beside `name` to clients that take them. @default false */
      precompressed?: boolean;
      /** Follow symbolic links below the root, wherever they lead. @default false */
      followSymlinks?: boolean;
      /** Up to 64 extensions and their content types, over the built-in ones: `{ md: 'text/markdown' }`. */
      contentTypes?: Record<string, string>;
      status?: never;
      contentType?: never;
      body?: never;
    };

  export type Route = StaticRoute | ProxyRoute | FileRoute;

  /** Timeouts are seconds, 0.05-3600. */
  export interface Server {
    /** To a complete request head. @default 10 */
    headerTimeout?: Seconds;
    /** The keep-alive gap between requests. @default 30 */
    idleTimeout?: Seconds;
    /** A queued response must move 1 KiB per window. @default 30 */
    writeTimeout?: Seconds;
    /** How long a drain waits for in-flight responses. @default 10 */
    shutdownTimeout?: Seconds;
    /** Open connections per process. @default 10000 */
    maxConnections?: number;
    /** Bytes in a proxied request body. @default 16777216 */
    maxRequestBody?: number;
    /** Keep a client's well-formed `X-Request-Id`. @default false */
    trustRequestId?: boolean;
    /** Serve HTTP/2: `h2` by ALPN on TLS, prior knowledge on plain listeners. @default true */
    http2?: boolean;
    /**
     * Up to 64 addresses or prefixes (`'10.0.0.0/8'`, `'::1'`) whose
     * `X-Forwarded-For` names the client: for rate limits, the
     * `X-Forwarded-For` sent upstream and the access log.
     */
    trustedProxies?: string[];
  }

  export interface Upstream {
    /** 1-64 servers: `'IPv4:port'`, `'[IPv6]:port'` or `'host:port'`. */
    servers: string[];
    /** @default 2 */
    connectTimeout?: Seconds;
    /** From the request being written to the response head, and gaps in the body. @default 30 */
    responseTimeout?: Seconds;
    /** How long an idle connection is kept for reuse. @default 60 */
    keepaliveTimeout?: Seconds;
    /** Idle connections kept per server, per worker; 0 keeps none. @default 32 */
    keepalive?: number;
    /** How long a server sits out after a failed connect. @default 10 */
    downTime?: Seconds;
    /** @default 'round-robin' */
    balance?: 'round-robin' | 'least-connections';
    /** Check each server actively. */
    healthCheck?: HealthCheck;
    /** How long a WebSocket tunnel may go without a byte either way. @default 300 */
    tunnelIdleTimeout?: Seconds;
    /** Connect over TLS. @default plain HTTP */
    tls?: UpstreamTls;
    /** How often names are looked up again, 1 s to a day. @default 30 */
    resolveInterval?: Seconds;
    /** The addresses a name's servers may have. @default 'any' */
    family?: 'any' | 'ipv4' | 'ipv6';
  }

  export interface HealthCheck {
    /** The path and query to request. */
    path: string;
    /** The `Host` field. @default the TLS server name, else the server as configured */
    host?: string;
    /** How often each server is checked. @default 5 */
    interval?: Seconds;
    /** For the response head; less than `interval`. @default 2 */
    timeout?: Seconds;
    /** Passes in a row that make an unhealthy server healthy, 1-10. @default 2 */
    healthy?: number;
    /** Failures in a row that make a server unhealthy, 1-10. @default 3 */
    unhealthy?: number;
  }

  /** Files are relative to the config file. */
  export interface UpstreamTls {
    /** Sent as SNI and checked against the certificate. @default each name; required with addresses */
    serverName?: string;
    /** The CAs to trust: a file or up to 16, PEM or DER. */
    ca: string | string[];
    /** Revocation lists from those CAs. */
    crl?: string | string[];
    /** xenia's own certificate chain, for servers that ask; with `key`. */
    cert?: string;
    /** The key for `cert`. */
    key?: string;
    /** @default '1.2' */
    minVersion?: '1.2' | '1.3';
  }

  export interface Tls {
    /** 1-64 certificates; the first is the default. */
    certificates: Certificate[];
    /** @default '1.2' */
    minVersion?: '1.2' | '1.3';
    /** Session resumption by ticket. @default true */
    sessionTickets?: boolean;
    /** Plain HTTP requests get `308` to HTTPS. @default false */
    redirect?: boolean;
    /** `Strict-Transport-Security` on TLS responses: `true` is a year. @default false */
    hsts?: boolean | Hsts;
  }

  /** PEM files, relative to the config file. */
  export interface Certificate {
    /** The chain, leaf first; at most 64 KiB. */
    cert: string;
    /** Its private key; at most 16 KiB. */
    key: string;
    /** Ask clients for certificates, for the names this one serves. */
    clients?: ClientAuth;
  }

  export interface ClientAuth {
    /** The CAs whose certificates count: a file or up to 16, PEM or DER. */
    ca: string | string[];
    /** Revocation lists from those CAs. */
    crl?: string | string[];
    /** No handshake without a verified certificate; `false` records one that verifies. @default true */
    required?: boolean;
  }

  export interface Hsts {
    /** Seconds. */
    maxAge?: number;
    /** @default false */
    includeSubDomains?: boolean;
    /** @default false */
    preload?: boolean;
  }

  export interface Limit {
    /** Requests a second, fractions allowed: one a day to a million a second. */
    rate: number;
    /** How many may come at once, 1 to 1,000,000. @default the rate rounded up, at least 1 */
    burst?: number;
    /** Clients tracked at once, 1,024 to 4,194,304. @default 65536 */
    clients?: number;
  }

  export interface Cache {
    /** The budget in bytes, 16 MiB to 64 GiB. */
    size: number;
    /** The largest body kept, at most `size`/128. @default 1 MiB, or size/128 if less */
    maxEntry?: number;
  }
}
