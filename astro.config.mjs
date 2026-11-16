import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://printablesprout.com';

// Tell Google when each printable last changed
const lastmod = {};
const usedCats = new Set(), usedOccs = new Set();
const catSlug = { 'Coloring Pages': 'coloring-pages', 'Holiday Printables': 'holiday-printables', 'Chore and Reward Charts': 'chore-reward-charts', 'Daily Routines': 'daily-routines', 'Activities and Games': 'activities-games', 'For Parents': 'for-parents' };
const dir = './src/content/printables';
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const head = fs.readFileSync(path.join(dir, f), 'utf8').split('\n---')[0];
  const slug = head.match(/^slug:\s*"?([^"\n]+)"?/m)?.[1];
  const date = head.match(/^updated:\s*(\S+)/m)?.[1] ?? head.match(/^date:\s*(\S+)/m)?.[1];
  const cat = head.match(/^category:\s*"([^"]+)"/m)?.[1]; if (cat) usedCats.add(catSlug[cat]);
  const occ = head.match(/^occasion:\s*"([^"]+)"/m)?.[1]; if (occ) usedOccs.add(occ);
  if (slug && date && !isNaN(Date.parse(date))) lastmod[`${SITE_URL}/${slug}/`] = new Date(date).toISOString();
}
const newest = Object.values(lastmod).sort().pop();

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({
    // Leave out search, 404, paged lists and empty (noindex) category or holiday pages
    filter: (p) => {
      if (p.includes('/search/') || p.includes('/404') || /\/\d+\/$/.test(p)) return false;
      const c = p.match(/\/category\/([^/]+)\//); if (c) return usedCats.has(c[1]);
      const o = p.match(/\/holiday\/([^/]+)\//); if (o) return usedOccs.has(o[1]);
      return true;
    },
    serialize(item) {
      if (lastmod[item.url]) item.lastmod = lastmod[item.url];
      else if (item.url === `${SITE_URL}/` || item.url.includes('/category/') || item.url.includes('/holiday/')) item.lastmod = newest;
      return item;
    },
  })],
});
