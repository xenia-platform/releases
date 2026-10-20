// Routes of their own file, which xenia.conf.js imports: a config may
// import .js and .mjs files inside its directory.

const names = ['about', 'contact'];

/** @type {import('xenia').StaticRoute[]} */
export const pages = names.map((page) => ({
  path: `/${page}`,
  contentType: 'text/html; charset=utf-8',
  headers: { 'cache-control': 'max-age=60' },
  body: `<!doctype html><title>${page}</title><h1>${page}</h1>\n`,
}));
