// Pinterest auto-publish feed: one item per printable with its 1000x1500 pin image.
// Pinterest reads <enclosure> / <media:content> for the image, <title> and <description> for the Pin.
import rss from '@astrojs/rss';
import fs from 'node:fs';
import path from 'node:path';
import { allPrintables } from '../lib/printables';
import { SITE } from '../lib/site';

export async function GET(context) {
  const items = (await allPrintables()).slice(0, 100).filter((p) =>
    fs.existsSync(path.join(process.cwd(), 'public/pins', `${p.data.slug}.png`)));
  return rss({
    title: `${SITE.name} Pins`,
    description: 'Free printable coloring pages, games and charts for kids. Color online or print free.',
    site: context.site,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items: items.map((p) => {
      const img = `${SITE.url}/pins/${p.data.slug}.png`;
      const bytes = fs.statSync(path.join(process.cwd(), 'public/pins', `${p.data.slug}.png`)).size;
      return {
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.date,
        link: `/${p.data.slug}/`,
        categories: [p.data.category],
        enclosure: { url: img, length: bytes, type: 'image/png' },
        customData: `<media:content url="${img}" medium="image" type="image/png" width="1000" height="1500"/>`,
      };
    }),
  });
}
