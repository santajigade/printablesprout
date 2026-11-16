import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://printablesprout.com';

// Tell Google when each printable last changed
const lastmod = {};
const dir = './src/content/printables';
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const head = fs.readFileSync(path.join(dir, f), 'utf8').split('\n---')[0];
  const slug = head.match(/^slug:\s*"?([^"\n]+)"?/m)?.[1];
  const date = head.match(/^updated:\s*(\S+)/m)?.[1] ?? head.match(/^date:\s*(\S+)/m)?.[1];
  if (slug && date && !isNaN(Date.parse(date))) lastmod[`${SITE_URL}/${slug}/`] = new Date(date).toISOString();
}
const newest = Object.values(lastmod).sort().pop();

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({
    filter: (p) => !p.includes('/search/') && !p.includes('/404') && !/\/\d+\/$/.test(p),
    serialize(item) {
      if (lastmod[item.url]) item.lastmod = lastmod[item.url];
      else if (item.url === `${SITE_URL}/` || item.url.includes('/category/') || item.url.includes('/holiday/')) item.lastmod = newest;
      return item;
    },
  })],
});
