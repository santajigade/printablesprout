// Pinterest auto-publish feed: one item per printable with its 1000x1500 pin image.
// Pinterest reads <enclosure> / <media:content> for the image, <title> and <description> for the Pin.
import rss from '@astrojs/rss';
import fs from 'node:fs';
import path from 'node:path';
import { allPrintables } from '../lib/printables';
import { allStories } from '../lib/stories';
import { SITE } from '../lib/site';

export async function GET(context) {
  // Printables use /pins/<slug>.png and link to /<slug>/; stories use /pins/stories-<slug>.png and /stories/<slug>/
  const entries = [
    ...(await allPrintables()).map((p) => ({ p, pin: `${p.data.slug}.png`, link: `/${p.data.slug}/`, cat: p.data.category })),
    ...(await allStories()).map((p) => ({ p, pin: `stories-${p.data.slug}.png`, link: `/stories/${p.data.slug}/`, cat: 'Stories' })),
  ].sort((a, b) => b.p.data.date.valueOf() - a.p.data.date.valueOf()).slice(0, 120)
   .filter((e) => fs.existsSync(path.join(process.cwd(), 'public/pins', e.pin)));
  return rss({
    title: `${SITE.name} Pins`,
    description: 'Free printable coloring pages, games and charts for kids. Color online or print free.',
    site: context.site,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items: entries.map(({ p, pin, link, cat }) => {
      const img = `${SITE.url}/pins/${pin}`;
      const bytes = fs.statSync(path.join(process.cwd(), 'public/pins', pin)).size;
      return {
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.date,
        link,
        categories: [cat],
        enclosure: { url: img, length: bytes, type: 'image/png' },
        customData: `<media:content url="${img}" medium="image" type="image/png" width="1000" height="1500"/>`,
      };
    }),
  });
}
