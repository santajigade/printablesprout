import rss from '@astrojs/rss';
import { allPrintables } from '../lib/printables';
import { SITE } from '../lib/site';
export async function GET(context) {
  const items = (await allPrintables()).slice(0, 50);
  return rss({ title: SITE.name, description: SITE.tagline, site: context.site,
    items: items.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.date, link: `/${p.data.slug}/`, categories: [p.data.category] })) });
}
