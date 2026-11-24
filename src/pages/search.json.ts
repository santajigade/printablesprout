import { allPrintables } from '../lib/printables';
import { allStories } from '../lib/stories';
export async function GET() {
  const items = await allPrintables();
  const stories = await allStories();
  return new Response(JSON.stringify([
    ...items.map((p) => ({ t: p.data.title, s: p.data.slug, c: p.data.category, d: p.data.description, k: (p.data.keywords ?? '') + ' ' + p.data.tags.join(' '), i: p.data.image })),
    ...stories.map((p) => ({ t: p.data.title, s: `stories/${p.data.slug}`, c: 'Stories', d: p.data.description, k: (p.data.keywords ?? '') + ' ' + p.data.tags.join(' '), i: p.data.image })),
  ]),
    { headers: { 'Content-Type': 'application/json' } });
}
